import { BooleanInput } from "@angular/cdk/coercion";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import {
	booleanAttribute,
	Component,
	computed,
	effect,
	inject,
	input,
	Type
} from "@angular/core";
import { JsonLogic } from "@app/adapters/json-logic";
import { SubmissionData } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { FormItemEntity } from "@db/types";
import { HlmFieldGroup } from "@spartan-ng/helm/field";
import { injectForm, injectStore } from '@tanstack/angular-form';
import { produce } from "immer";
import { entries } from "lodash";
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

		for (const [k, v] of entries(newValue)) {
			debugger;
			this.form.baseStore.setState(current => produce(current, draft => {
				draft.values[k] = v;
			}));
		}
	})

	readonly formItems = input<FormItemEntity[]>([]);
	readonly submissionData = input<Strict<SubmissionData>>({});
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
	protected readonly canSubmit = injectStore(this.form, state => state.canSubmit);
	protected readonly formSubmitting = injectStore(this.form, state => state.isSubmitting);
	protected readonly renderers = {
		field: import("../items/field/wrapper/field-item-renderer-wrapper").then(
			(m) => m.FieldItemRendererWrapper,
		),
	} as Record<string, Promise<Type<any>>>;

	private evaluateRelevance(data: SubmissionData, logic: any) {
		return this.logic.run(logic, data);
	}

	protected handleSubmit(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		this.form.handleSubmit();
	}
}
