import { Component, computed } from "@angular/core";
import { FormItemField } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { HlmField } from "@spartan-ng/helm/field";
import { injectField, TanStackAppField } from "@tanstack/angular-form";
import { injectRenderedFieldContext, injectRenderedFormItemContext } from "../../context";

export type FieldType = FormItemField['config']['type'];

@Component({
	selector: 'cv-base-field-renderer',
	template: '',
	hostDirectives: [
		HlmField,
		{
			directive: TanStackAppField,
			inputs: ['name', 'tanstackField']
		},
	]
})
export abstract class BaseFieldRenderer<TFieldType extends Strict<FieldType>, TValue> {
	private itemContext = injectRenderedFormItemContext<Strict<FormItemField>>();
	private fieldContext = injectRenderedFieldContext<TValue>();

	// protected readonly withForm = injectWithForm(submissionDataFormOptions );
	protected readonly field = injectField<TValue>();
	protected readonly definition = this.itemContext.definition;
	protected readonly fieldId = this.fieldContext.fieldId;
	protected readonly path = computed(() => this.definition().path);
	protected readonly config = computed(() => this.definition().config as Extract<Strict<FormItemField>['config'], { type: TFieldType }>);
	protected readonly dataKey = computed(() => this.config().dataKey);
}
