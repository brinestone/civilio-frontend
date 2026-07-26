import { Component, computed } from "@angular/core";
import { Strict } from "@civilio/shared";
import { QuestionConfig, QuestionItem } from "@db/schemas";
import { HlmField } from "@spartan-ng/helm/field";
import { injectField, TanStackAppField } from "@tanstack/angular-form";
import { injectRenderedFieldContext, injectRenderedFormItemContext } from "../../context";

export type FieldType = QuestionConfig['type'];

@Component({
	selector: 'cv-base-field-renderer',
	template: '',
	hostDirectives: [
		HlmField,
		{
			directive: TanStackAppField,
			inputs: ['name', 'tanstackField', 'validators']
		},
	],
})
export abstract class BaseFieldRenderer<TFieldType extends FieldType, TValue> {
	private itemContext = injectRenderedFormItemContext<Strict<QuestionItem>>();
	private fieldContext = injectRenderedFieldContext<TValue>();
	protected readonly field = injectField<TValue>();
	protected readonly definition = this.itemContext.definition;
	protected readonly fieldId = this.fieldContext.fieldId;
	protected readonly path = computed(() => this.definition().path);
	protected readonly config = computed(() => this.definition().config as Extract<Strict<QuestionConfig>, { type: TFieldType }>);
	protected readonly dataKey = computed(() => this.config().dataKey);
	protected readonly defaultValue = computed(() => this.config().defaultValue as TValue | undefined)

	protected readonly hintText = computed(() => {
		return this.config().description ?? '';
	});
}
