import { BooleanInput } from "@angular/cdk/coercion";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import {
	booleanAttribute,
	Component,
	computed,
	effect,
	inject,
	input,
	TemplateRef,
	Type,
	untracked
} from "@angular/core";
import { JsonLogic } from "@app/adapters/json-logic";
import { SubmissionData } from "@civilio/sdk/models";
import { FormItemType } from "@db/schemas";
import { FormItemEntity } from "@db/types";
import { HlmFieldGroup } from "@spartan-ng/helm/field";
import { injectForm, injectStore } from '@tanstack/angular-form';
import entries from 'lodash/entries';
import { submissionDataFormOptions } from "../form-renderer-config";

@Component({
	selector: "cv-form-renderer",
	templateUrl: "./form-renderer.html",
	styleUrl: "./form-renderer.scss",
	imports: [HlmFieldGroup, NgComponentOutlet, AsyncPipe],
	providers: [JsonLogic,]
})
export class FormRenderer {
	private readonly logic = inject(JsonLogic);
	#updateFormValueEffect = effect(() => {
		const newValue = this.submissionData();
		if (!newValue) return;
		for (const [k, v] of entries(newValue)) {
			// this.form.baseStore.setState(current => produce(current.values, draft => {
			// 	draft.values[k] = v;
			// }, (patches, inversePatches) => {
			// 	// TODO: Push into undo/redo stacks
			// }));
		}
	});

	readonly formItems = input<FormItemEntity[]>([]);
	readonly submissionData = input<SubmissionData>({}, { alias: 'formData' });
	readonly showMissingRendererMessages = input<boolean, BooleanInput>(false, { transform: booleanAttribute })
	readonly itemFallbackContent = input<TemplateRef<any>>();
	readonly preview = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	protected readonly dataKeyItems = computed(() => {
		return this.formItems().filter(i => i.type == 'question' || i.type == 'group');
	});
	protected readonly form = injectForm({
		...submissionDataFormOptions,
		onSubmit: async ({ value }) => {

		}
	});
	protected readonly canMergeRemoteChanges = injectStore(this.form, state => !state.isDirty);
	protected readonly canSubmit = injectStore(this.form, state => state.canSubmit);
	protected readonly formSubmitting = injectStore(this.form, state => state.isSubmitting);
	protected readonly renderers = {
		question: import("../items/field/wrapper/field-item-renderer-wrapper").then(
			(m) => m.FieldItemRendererWrapper,
		),
	} as Record<FormItemType, Promise<Type<any>>>;
	#updateFormData = effect(() => {
		const canProceed = untracked(this.canMergeRemoteChanges);
		if (!canProceed) return;

		for (const [k, v] of entries(this.submissionData())) {
			this.form.setFieldValue(k, v, { dontRunListeners: true })
		}
	});

	private evaluateRelevance(data: SubmissionData, logic: any) {
		return this.logic.run(logic, data);
	}

	protected handleSubmit(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		this.form.handleSubmit();
	}
}
