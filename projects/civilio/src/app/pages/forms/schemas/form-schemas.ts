import { Signal } from "@angular/core";
import { applyEach, debounce, hidden, maxLength, required, SchemaPathTree, validateHttp } from "@angular/forms/signals";
import { FormDefinitionInput, FormDefinitionInputSchema } from "@app/model/form";

const debounceDuration = 200;


export function defineFormDefinitionFieldsFormSchema(paths: SchemaPathTree<FormDefinitionInput['fields'][number]>) {

}

export function defineFormDefinitionSectionFormSchema(paths: SchemaPathTree<FormDefinitionInput['sections'][number]>) {
	debounce(paths.title, debounceDuration);
	required(paths.title, { message: 'A section must have a label' });

}

export function defineFormDefinitionFormSchema(options: {
	apiUrl: Signal<string>;
	currentName: Signal<string | undefined>;
}) {
	return (paths: SchemaPathTree<FormDefinitionInput>) => {
		hidden(paths.name, () => true);
		debounce(paths.label, debounceDuration);
		debounce(paths.description, debounceDuration);

		// Name
		// required(paths.name, { message: 'A form must have a unique name' });
		// validateHttp<string, { available: boolean }>(paths.name, {
		// 	request: ({ value }) => value() && value() !== options.currentName() ? `${options.apiUrl()}/forms/name-available?name=${encodeURIComponent(value())}` : undefined,
		// 	onError: () => ({
		// 		kind: 'networkError',
		// 		message: 'Could not validate form name availability due to a network error'
		// 	}),
		// 	onSuccess: (response,) => {
		// 		if (!response.available) {
		// 			return { kind: 'uniqueName', message: 'This form name is already taken' };
		// 		}
		// 		return null;
		// 	}
		// });

		// Label
		required(paths.label, { message: 'A form must have a label' });

		// Description
		maxLength(paths.description, 500, { message: 'Description cannot exceed 500 characters' });

		// Fields
		applyEach(paths.fields, defineFormDefinitionFieldsFormSchema);

		// Sections
		applyEach(paths.sections, defineFormDefinitionSectionFormSchema);
	}
}

export function defaultFormDefinitionSchemaValue() {
	return FormDefinitionInputSchema.parse({});
}
