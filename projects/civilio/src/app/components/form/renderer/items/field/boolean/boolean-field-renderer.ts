import { Component } from "@angular/core";
import { BooleanQuestionConfig } from "@db/schemas";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmCheckbox } from "@spartan-ng/helm/checkbox";
import { HlmField, HlmFieldDescription, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmSelect, HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue } from "@spartan-ng/helm/select";
import { BaseFieldRenderer } from "../base-field-renderer/base-field-renderer";

@Component({
	selector: 'cv-boolean-field-renderer',
	templateUrl: './boolean-field-renderer.html',
	imports: [
		HlmField,
		HlmFieldLabel,
		HlmCheckbox,
		HlmFieldDescription,
		BrnSelectImports,
		HlmSelect,
		HlmSelectTrigger,
		HlmSelectValue,
		HlmSelectContent,
		HlmSelectOption
	]
})
export class BooleanFieldRenderer extends BaseFieldRenderer<BooleanQuestionConfig['type'], boolean | undefined | null> {

}
