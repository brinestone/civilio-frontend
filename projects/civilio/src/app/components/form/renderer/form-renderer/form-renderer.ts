import { BooleanInput } from "@angular/cdk/coercion";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import {
	booleanAttribute,
	Component,
	computed,
	effect,
	inject,
	input,
	output,
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

export type FormState = {
	canSubmit: boolean;
	isDefault: boolean;
	valid: boolean;
	dirty: boolean;
	/**
	 * Whether remote changes can be merged without triggering user interaction events
	 */
	remoteMergable: boolean;
	submitting: boolean;
	validating: boolean;
	submissionAttempts: number;
	touched: boolean;
	errors: unknown[];
	errorMap: Record<string, unknown>;
	fieldErrors: Record<string, unknown[]>;
	pristine: boolean;
}

@Component({
	selector: "cv-form-renderer",
	templateUrl: "./form-renderer.html",
	styleUrl: "./form-renderer.scss",
	imports: [HlmFieldGroup, NgComponentOutlet, AsyncPipe],
	providers: [JsonLogic,]
})
export class FormRenderer {
	private readonly logic = inject(JsonLogic);
	readonly stateChange = output<FormState>();
	readonly formItems = input<FormItemEntity[]>([]);
	readonly submissionData = input.required<SubmissionData>({ alias: 'formData' });
	readonly showMissingRendererMessages = input<boolean, BooleanInput>(false, { transform: booleanAttribute })
	readonly itemFallbackContent = input<TemplateRef<any>>();
	readonly preview = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	protected readonly dataKeyItems = computed(() => {
		return this.formItems().filter(i => i.type == 'question' || i.type == 'group');
	});
	protected readonly form = injectForm({
		defaultValues: {} as SubmissionData
	});
	protected readonly renderers = {
		question: import("../items/field/wrapper/field-item-renderer-wrapper").then(
			(m) => m.FieldItemRendererWrapper,
		),
	} as Record<FormItemType, Promise<Type<any>>>;
	protected readonly canMergeRemoteChanges = injectStore(this.form, state => !state.isDirty);
	protected readonly formState = injectStore(this.form, state => ({
		canSubmit: state.canSubmit,
		isDefault: state.isDefaultValue,
		dirty: state.isDirty,
		remoteMergable: !state.isDirty,
		submitting: state.isSubmitting,
		valid: state.isValid,
		touched: state.isTouched,
		submissionAttempts: state.submissionAttempts,
		validating: state.isValidating,
		pristine: state.isPristine,
		errorMap: state.errorMap,
		errors: state.errors,
		fieldErrors: Object.entries(state.fieldMeta).reduce((acc, [k, meta]) => {
			acc[k] = meta?.errors ?? [];
			return acc;
		}, {} as Record<string, unknown[]>)
	}) as FormState);
	#mergeRemoteChanges = effect(() => {
		const canProceed = untracked(this.canMergeRemoteChanges);
		if (!canProceed) return;

		this.form.reset(this.submissionData());
	});
	#emitStateChanges = effect(() => {
		this.stateChange.emit(this.formState());
	})

	private evaluateRelevance(data: SubmissionData, logic: any) {
		return this.logic.run(logic, data);
	}

	protected handleSubmit(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		this.form.handleSubmit();
	}
}
