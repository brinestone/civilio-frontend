import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, resource, Signal, signal } from '@angular/core';
import { debounce, form, FormField, required, submit, validateAsync } from '@angular/forms/signals';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FieldError } from '@app/components/form';
import { HasPendingChanges } from '@app/model/form';
import { FormService2 } from '@app/services/form';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFormInput, lucidePlus, lucideSave, lucideTrash2 } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmH3 } from "@spartan-ng/helm/typography";
import { Observable } from 'rxjs';

@Component({
	selector: 'cv-forms-definition-layout',
	viewProviders: [
		provideIcons({
			lucideFormInput,
			lucideSave,
			lucideTrash2,
			lucidePlus
		})
	],
	imports: [
		HlmEmptyImports,
		HlmDialogImports,
		HlmFieldImports,
		RouterOutlet,
		NgIcon,
		FormField,
		HlmTextarea,
		HlmButton,
		HlmSpinner,
		FieldError,
		HlmInput,
		NgTemplateOutlet,
		HlmH3
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form-schemas.layout.component.html',
	styleUrl: './form-schemas.layout.component.scss',
})
export class SchemasLayout implements HasPendingChanges {
	private readonly navigate = dispatch(Navigate);
	private readonly formService = inject(FormService2);
	private readonly titleCheckCache = new Map<string, boolean>();
	protected readonly newFormDialogState = signal<BrnDialogState>('closed');
	protected readonly route = inject(ActivatedRoute);
	protected readonly forms = resource({
		loader: async () => {
			const result = await this.formService.lookupFormDefinitions();
			return result ?? [];
		},
		defaultValue: []
	});
	protected readonly formsAvailable = computed(() => this.forms.value().length > 0);
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

	private createFormTitleCheckResource(titleSignal: Signal<string | undefined>) {
		return resource({
			params: () => titleSignal(),
			loader: async ({ params: title }) => {
				if (!title) return undefined;

				const cached = this.titleCheckCache.get(title);
				if (cached !== undefined) return cached;

				const result = await this.formService.checkFormTitleAvailability(title);
				this.titleCheckCache.set(title, result.available!);
				return result.available!;
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

	protected async onFormSubmit(event: Event) {
		event?.preventDefault();
		await submit(this.newFormForm, async tree => {
			const value = tree().value();
			try {
				const result = await this.formService.createNewForm({
					description: value.description,
					title: value.title
				});
				tree().reset(defaultFormData());
				this.newFormDialogState.set('closed');
				this.navigate(['create-new'], {
					fv: result.version,
					slug: result.slug,
				}, {
					relativeTo: this.route
				}).subscribe();
				return null;
			} catch (e) {
				return { kind: 'submitError', message: 'Could not submit' }
			}
		});
	}
}

type NewFormData = {
	title: string;
	description: string;
}

function defaultFormData() {
	return {
		title: null as any,
		description: null as any
	} as Strict<NewFormData>;
}
