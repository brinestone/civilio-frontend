import { CdkListbox, CdkOption } from "@angular/cdk/listbox";
import { Component, computed, effect, HostListener, input, isDevMode, output, signal, untracked } from "@angular/core";
import { FormItem, SectionItem } from "@db/schemas";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle, lucideLoader, lucideSave, lucideTrash, lucideTrash2 } from "@ng-icons/lucide";
import { injectForm, injectStore } from "@tanstack/angular-form";
import { entries, groupBy } from "lodash";
import { SectionRenderer } from "../section-renderer/section-renderer";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmKbd, HlmKbdGroup } from "@spartan-ng/helm/kbd";
import { toast } from "ngx-sonner";
import { HlmSpinner } from "@spartan-ng/helm/spinner";

@Component({
	selector: 'cv-form-renderer',
	templateUrl: './form-renderer.html',
	styleUrl: './form-renderer.scss',
	imports: [
		SectionRenderer,
		NgIcon,
		CdkListbox,
		CdkOption,
		HlmButton,
		HlmKbd,
		HlmKbdGroup,
		HlmSpinner
	],
	viewProviders: [
		provideIcons({
			lucideAlertTriangle,
			lucideTrash2,
			lucideLoader,
			lucideSave
		})
	]
})
export class FormRenderer<TData extends Record<string, unknown>> {
	readonly formData = input.required<TData>();
	readonly formItems = input.required<FormItem[]>()
	readonly description = input<string>();
	readonly logo = input<string>();
	readonly title = input.required<string>();
	readonly submitHandler = input.required<((data: TData) => Promise<void>)>();
	protected readonly isDevMode = isDevMode;
	protected readonly dataForm = injectForm({
		defaultValues: {} as TData,
		onSubmit: async ({ value }) => {
			const handler = this.submitHandler();
			await handler(value);
		},
		onSubmitInvalid: async ({ value }) => {
			if (!this.ignoreInvalidSubmissions()) {
				toast.warning('There are some invalid fields', {
					action: {
						label: 'Save changes anyway',
						onClick: () => this.ignoreInvalidSubmissions.set(true)
					}
				});
				return;
			}

			const handler = this.submitHandler();
			await handler(value);
		}
	});
	protected readonly ignoreInvalidSubmissions = signal(false);
	protected readonly canSubmit = injectStore(this.dataForm, state => state.canSubmit);
	protected readonly submitting = injectStore(this.dataForm, state => state.isSubmitting);
	protected readonly validating = injectStore(this.dataForm, state => state.isValidating);
	protected readonly dirty = injectStore(this.dataForm, state => state.isDirty);
	protected readonly pristine = injectStore(this.dataForm, state => state.isPristine);
	protected readonly sections = computed(() => this.formItems().filter(i => i.type == 'section') as SectionItem[]);
	protected readonly canMergeRemoteChanges = injectStore(this.dataForm, state => !state.isDirty);
	#mergeRemoteChanges = effect(() => {
		const canProceed = untracked(this.canMergeRemoteChanges);
		if (!canProceed) return;
		const changes = this.formData();
		this.dataForm.reset(changes, { keepDefaultValues: false });
	});
	@HostListener('window:keydown.control.s')
	protected onFormSubmit(event?: Event) {
		event?.preventDefault();
		if (this.pristine()) return;
		this.dataForm.handleSubmit();
	}
	@HostListener('window:keydown.escape')
	protected onFormReset(event?: Event) {
		event?.preventDefault();
		if (this.pristine()) return;
		// TODO: show the user a confirmation dialog.

		this.dataForm.reset();
	}
}
