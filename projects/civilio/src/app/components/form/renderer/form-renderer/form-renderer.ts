import { BooleanInput } from "@angular/cdk/coercion";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import {
	booleanAttribute,
	Component,
	computed,
	input,
	linkedSignal,
	Type,
	Injector,
	inject,
} from "@angular/core";
import { form } from "@angular/forms/signals";
import { FormVersionDefinition, SubmissionData } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { defineFormRendererFormSchema } from "../form-renderer-config";
import { LogicEngine } from "json-logic-engine";
import { JsonLogic } from "@app/adapters/json-logic";

@Component({
	selector: "cv-form-renderer",
	templateUrl: "./form-renderer.html",
	styleUrl: "./form-renderer.scss",
	imports: [HlmFieldImports, NgComponentOutlet, AsyncPipe],
	providers: [JsonLogic],
})
export class FormRenderer {
	private readonly logic = inject(JsonLogic);

	readonly formDefinition = input.required<Strict<FormVersionDefinition>>();
	readonly submissionData = input<Strict<SubmissionData>>({});
	readonly preview = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	protected readonly formData = linkedSignal(() => this.submissionData());
	protected readonly formModel = form(
		this.formData,
		defineFormRendererFormSchema(
			this.formDefinition,
			this.evaluateRelevance.bind(this),
		),
	);
	protected readonly renderers = {
		field: import("../items/text-field-renderer/field-renderer").then(
			(m) => m.FieldRenderer,
		),
	} as Record<string, Promise<Type<any>>>;

	private evaluateRelevance(data: SubmissionData, logic: any) {
		return this.logic.evaluate(logic, data);
	}
}
