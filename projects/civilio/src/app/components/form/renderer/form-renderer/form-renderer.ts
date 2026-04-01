import { AsyncPipe, JsonPipe, NgComponentOutlet } from "@angular/common";
import { Component, input, Type } from "@angular/core";
import { FormVersionDefinition } from "@civilio/sdk/models";

@Component({
	selector: "cv-form-renderer",
	templateUrl: "./form-renderer.html",
	styleUrl: './form-renderer.scss',
	imports: [
		NgComponentOutlet,
		AsyncPipe
	],
})
export class FormRenderer {
	readonly formDefinition = input.required<FormVersionDefinition>();

	protected readonly renderers = {
		field: import('../items/text-field-renderer/field-renderer').then(m => m.FieldRenderer)
	} as Record<string, Promise<Type<any>>>;
}
