import { Component, computed } from "@angular/core";
import { HlmField, HlmFieldDescription, HlmFieldError, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { BaseFieldRenderer } from "../base-field-renderer/base-field-renderer";

@Component({
	selector: 'cv-number-field-renderer',
	templateUrl: './number-field-renderer.html',
	imports: [
		HlmFieldLabel,
		HlmField,
		HlmFieldDescription,
		HlmInput,
		HlmFieldError
	]
})
export class NumberFieldRenderer extends BaseFieldRenderer<'integer' | 'float', number> {

}
