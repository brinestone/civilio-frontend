import { DatePipe, JsonPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, form, FormField, hidden, required, submit, validate, validateAsync } from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FieldError } from '@app/components/form';
import { HasPendingChanges } from '@app/model/form';
import { randomString } from '@app/util';
import { FormsService } from '@civilio/sdk/services/forms/forms.service';
import { Strict } from '@civilio/shared';
import { createForm } from '@db/actions';
import { formsCollection, formVersionsCollection } from '@db/collections';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideCopy, lucideEye, lucideFormInput, lucidePencil, lucidePlus, lucideSave } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmH3 } from "@spartan-ng/helm/typography";
import { eq, injectLiveQuery } from '@tanstack/angular-db';
import { produce } from 'immer';
import { EMPTY, lastValueFrom, map, Observable, of } from 'rxjs';

@Component({
	selector: 'cv-forms-definition-layout',
	viewProviders: [
		provideIcons({
			lucideFormInput,
			lucideArchive,
			lucideEye,
			lucideCopy,
			lucidePencil,
			lucideSave,
			lucidePlus
		})
	],
	imports: [
		HlmEmptyImports,
		HlmDialogImports,
		HlmAlertDialogImports,
		HlmFieldImports,
		RouterLink,
		NgIcon,
		FormField,
		HlmTextarea,
		HlmSkeleton,
		HlmButton,
		HlmSeparator,
		HlmButton,
		HlmSpinner,
		FieldError,
		HlmInput,
		NgTemplateOutlet,
		HlmH3
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './all-forms.page.html',
	styleUrl: './all-forms.page.scss',
})
export class AllFormsPage implements HasPendingChanges {
	private readonly navigate = dispatch(Navigate);
	private readonly formService = inject(FormsService);
	private readonly titleCheckCache = new Map<string, boolean>();
	protected readonly newFormDialogState = signal<BrnDialogState>('closed');
	protected readonly route = inject(ActivatedRoute);
	protected readonly forms = injectLiveQuery({
		query: q => q.from({ forms: formsCollection })
			.leftJoin({ fv: formVersionsCollection }, ({ forms, fv }) => eq(forms.slug, fv.form))
			.select(({ forms, fv }) => ({
				title: forms.title,
				slug: forms.slug,
				currentVersion: { id: fv.id }
			}))
	});
	protected readonly formsAvailable = computed(() => this.forms.data().length > 0 && this.forms.status() == 'ready');
	private readonly formData = signal<NewFormData>(defaultFormData());
	protected readonly newFormForm = form(this.formData, paths => {
		required(paths.title, { message: 'This field is required' });
		debounce(paths.title, 200);
		validateAsync(paths.title, {
			params: ({ value }) => value() ?? '',
			factory: this.createFormTitleCheckResource.bind(this),
			onSuccess: (result) => {
				return result ? null : { kind: 'titleTaken', message: 'This title is already in use' }
			},
			onError: (err) => {
				console.error(err);
				return {
					kind: 'serverError',
					message: 'Could not check title availability'
				}
			}
		});
	});
	protected readonly archivingFormData = signal<ArchiveFormFormData>(defaultArchiveFormData());
	protected readonly archivingPromptForm = form(this.archivingFormData, paths => {
		hidden(paths.title, () => true);
		debounce(paths.confirmationTitle, 200);
		required(paths.confirmationTitle, { message: 'A value is required' });
		validate(paths.confirmationTitle, ({ valueOf, value }) => {
			if (!value()) return null;
			return value() !== valueOf(paths.title) ? { message: `Value must equal "${valueOf(paths.title)}"`, kind: 'match' } : null;
		});
	})
	protected readonly formActions = [
		{ icon: 'lucidePencil', route: (form: ReturnType<typeof this.forms.data>[number]) => ({ query: { version: form.currentVersion.id ?? 'current' }, path: [form.slug, 'designer'] }) },
		{ icon: 'lucideArchive', handler: this.onArchiveFormButtonClicked.bind(this) }
	];
	protected readonly formArchivingDialogState = signal<BrnDialogState>('closed');

	private onArchiveFormButtonClicked(form: ReturnType<typeof this.forms.data>[number]) {
		this.archivingPromptForm
		this.archivingPromptForm().value.update(v => produce(v, draft => {
			draft.title = form.title as string;
			draft.slug = form.slug as string;
		}));
		this.formArchivingDialogState.set('open');
	}

	private createFormTitleCheckResource(titleSignal: Signal<string | undefined>) {
		return rxResource({
			params: () => titleSignal(),
			stream: ({ params: title }) => {
				if (!title) return EMPTY;

				const cached = this.titleCheckCache.get(title);
				if (cached !== undefined) return of(cached);

				return this.formService.isFormTitleAvailable({ title }).pipe(
					map(r => r.available)
				);
			}
		})
	}

	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}

	protected onNewFormDialogStateChanged(state: BrnDialogState) {
		if (state == 'closed') {
			this.newFormForm().reset(defaultFormData());
			this.titleCheckCache.clear();
		}
		this.newFormDialogState.set(state);
	}

	protected onArchivingFormDialogStateChanged(state: BrnDialogState) {
		if (state == 'closed') {
			this.archivingPromptForm().reset(defaultArchiveFormData());
		}
		this.formArchivingDialogState.set(state);
	}

	protected async onSubmitArchivingForm(event: Event) {
		event.preventDefault();
		if (this.archivingPromptForm().invalid()) {
			return;
		}
		await submit(this.archivingPromptForm, {
			action: async (tree) => {
				await lastValueFrom(this.formService.toggleArchivedStatus(tree.slug().value()))
				this.formArchivingDialogState.set('closed');

			},
			onInvalid: () => { }
		})
	}

	private readonly newFormAction = createForm();
	protected async onSubmitNewFormForm(event: Event) {
		event.preventDefault();
		if (this.newFormForm().invalid()) {
			return;
		}
		await submit(this.newFormForm, async tree => {
			const value = tree().value();
			try {
				const version = crypto.randomUUID();
				const slug = randomString(16);
				const tx = this.newFormAction({
					version,
					slug,
					title: value.title,
					description: value.description
				});
				await tx.commit();
				tree().reset(defaultFormData());
				this.newFormDialogState.set('closed');
				this.navigate([slug, 'edit', version], undefined, { relativeTo: this.route }).subscribe();
				return null;
			} catch (e) {
				return { kind: 'submitError', message: 'Could not submit' }
			}
		});
	}
	protected async onCopyButtonClicked(text: string) {
		navigator.clipboard.writeText(text);
	}
}

type ArchiveFormFormData = {
	confirmationTitle: string;
	title: string;
	slug: string;
}

type NewFormData = {
	title: string;
	description: string;
}

function defaultArchiveFormData() {
	return {
		confirmationTitle: null as any,
		title: null as any,
		slug: null as any,
	} as Strict<ArchiveFormFormData>;
}
function defaultFormData() {
	return {
		title: null as any,
		description: null as any
	} as Strict<NewFormData>;
}
