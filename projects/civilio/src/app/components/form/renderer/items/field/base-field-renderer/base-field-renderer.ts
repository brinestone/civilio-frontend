import { Component, computed, inject } from "@angular/core";
import { FormItemField } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { HlmField } from "@spartan-ng/helm/field";
import { injectRenderedFieldContext, injectRenderedFormItemContext } from "../../context";
import { FormGroupDirective } from "@angular/forms";

export type FieldType = FormItemField['config']['type'];

@Component({
	selector: 'cv-base-field-renderer',
	template: '',
	hostDirectives: [
		HlmField
	]
})
export abstract class BaseFieldRenderer<TFieldType extends Strict<FieldType>, TValue> {
	private itemContext = injectRenderedFormItemContext<Strict<FormItemField>>();
	private fieldContext = injectRenderedFieldContext<TValue>();

	protected readonly formGroupDirective = inject(FormGroupDirective);
	protected readonly definition = this.itemContext.definition;
	protected readonly fieldId = this.fieldContext.fieldId;
	// protected readonly field = this.fieldContext.formControlName;
	protected readonly path = computed(() => this.definition().path);
	protected readonly config = computed(() => this.definition().config as Extract<FormItemField['config'], { type: TFieldType }>);
	// protected readonly field
}
