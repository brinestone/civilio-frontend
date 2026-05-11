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
import { FormRecord, ReactiveFormsModule } from "@angular/forms";
import { JsonLogic } from "@app/adapters/json-logic";
import { FormItemField, FormVersionDefinition, SubmissionData } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { HlmFieldGroup } from "@spartan-ng/helm/field";
import difference from 'lodash/difference';
import keys from "lodash/keys";
import { toFormControl } from "../form-renderer-config";

@Component({
	selector: "cv-form-renderer",
	templateUrl: "./form-renderer.html",
	styleUrl: "./form-renderer.scss",
	imports: [HlmFieldGroup, NgComponentOutlet, AsyncPipe, ReactiveFormsModule],
	providers: [JsonLogic,]
})
export class FormRenderer {
	private readonly logic = inject(JsonLogic);

	readonly formDefinition = input<Strict<FormVersionDefinition>>({ items: [], parentId: '', id: '' });
	readonly submissionData = input<Strict<SubmissionData>>({});
	readonly preview = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	protected readonly flatFields = computed(() => {
		return this.formDefinition().items.filter(i => i.type == 'field' || i.type == 'group')
			.flatMap(i => i.type == 'field' ? [i] : i.config.fields);
	});

	protected readonly dataForm = new FormRecord({});

	protected readonly renderers = {
		field: import("../items/field/wrapper/field-item-renderer-wrapper").then(
			(m) => m.FieldItemRendererWrapper,
		),
	} as Record<string, Promise<Type<any>>>;

	private evaluateRelevance(data: SubmissionData, logic: any) {
		return this.logic.run(logic, data);
	}

	constructor() {
		effect(() => {
			const fields = this.flatFields();
			this.updateFormControls(fields);
		})
	}

	private updateFormControls(fields: Strict<FormItemField>[]) {
		const dataKeys = new Set<string>(fields.map(f => f.config.dataKey))
		const removedKeys = difference(keys(this.dataForm.controls), [...dataKeys]);
		removedKeys.forEach(k => this.dataForm.removeControl(k));

		for (const field of fields) {
			const isExisting = this.dataForm.contains(field.config.dataKey);
			if (isExisting) continue;
			const control = toFormControl(field.config);
			this.dataForm.addControl(field.config.dataKey, control);
		}

	}
}
