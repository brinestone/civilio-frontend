import { Component, computed } from "@angular/core";
import { IsStringPipe } from "@app/pipes";
import { HlmField, HlmFieldDescription, HlmFieldError, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { BaseFieldRenderer } from "../base-field-renderer/base-field-renderer";
import { TextQuestionConfig } from "@db/schemas";

@Component({
	selector: 'cv-text-field-renderer',
	templateUrl: './text-field-renderer.html',
	styleUrl: './text-field-renderer.scss',
	imports: [
		HlmFieldLabel,
		HlmFieldDescription,
		HlmTextarea,
		HlmField,
		HlmFieldError,
		IsStringPipe,
		HlmInput
	]
})
export class TextFieldRenderer extends BaseFieldRenderer<TextQuestionConfig['type'], string> {
	protected readonly placeholderText = computed(() => {
		return this.config().placeholder ?? ''
	});
}
