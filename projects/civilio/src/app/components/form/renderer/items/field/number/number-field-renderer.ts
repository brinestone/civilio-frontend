import { Component } from "@angular/core";
import { IsStringPipe } from "@app/pipes";
import { HlmField, HlmFieldDescription, HlmFieldError, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { BaseFieldRenderer } from "../base-field-renderer/base-field-renderer";
import { NumberQuestionConfig } from "@db/schemas";

@Component({
	selector: 'cv-number-field-renderer',
	templateUrl: './number-field-renderer.html',
	imports: [
		HlmFieldLabel,
		HlmField,
		HlmFieldDescription,
		HlmInput,
		HlmFieldError,
		IsStringPipe
	]
})
export class NumberFieldRenderer extends BaseFieldRenderer<NumberQuestionConfig['type'], number | undefined | null> {
}
