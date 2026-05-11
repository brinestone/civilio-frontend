import { NgTemplateOutlet } from "@angular/common";
import { Component, computed } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { HlmField, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { BaseFieldRenderer } from "../base-field-renderer/base-field-renderer";

@Component({
	selector: 'cv-text-field-renderer',
	templateUrl: './text-field-renderer.html',
	styleUrl: './text-field-renderer.scss',
	imports: [
		HlmFieldLabel,
		HlmTextarea,
		HlmField,
		HlmInput,
		ReactiveFormsModule,
		NgTemplateOutlet
	]
})
export class TextFieldRenderer extends BaseFieldRenderer<'text' | 'multiline', string> {
	protected readonly placeholderText = computed(() => {
		return this.config().placeholder ?? ''
	});
	protected readonly hintText = computed(() => {
		return this.config().description ?? '';
	});
}
