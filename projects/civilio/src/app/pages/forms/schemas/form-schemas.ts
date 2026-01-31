import { Signal } from "@angular/core";
import { applyEach, debounce, hidden, required, SchemaPathTree } from "@angular/forms/signals";
import { Strict } from "@app/model/form";
import { FormItemDefinition, FormVersionDefinition } from "@civilio/sdk/models";

export type FormModel = Strict<FormVersionDefinition>;

const debounceDuration = 200;

function defineFormItemDefinitionFormSchema(paths: SchemaPathTree<Strict<FormItemDefinition>>) {
	// title
	debounce(paths.title, debounceDuration);
	required(paths.title, { message: 'A title is required' });

	// description
	debounce(paths.description, debounceDuration);

	// id
	hidden(paths.id, () => true);

	// meta
	hidden(paths.meta, () => true);

	// position
	hidden(paths.position, () => true);

	// type
	required(paths.type, { message: 'A type is required' });
}

export function defineFormDefinitionFormSchema(options: {
	enableEditing: Signal<boolean>
}) {
	return (paths: SchemaPathTree<ReturnType<typeof defaultFormDefinitionSchemaValue>>) => {
		hidden(paths.id, () => true);
		hidden(paths.parentId, () => true);
		applyEach(paths.items, defineFormItemDefinitionFormSchema as any);
	}
}

export function defaultFormDefinitionSchemaValue() {
	return {
		id: '',
		parentId: '',
		items: [],
	} as FormModel
}
export function domainToStrictFormDefinition(value: FormVersionDefinition) {
	return value as FormModel;
}
export function defaultFormItemDefinitionSchemaValue(position: number) {
	return {
		description: '',
		id: '',
		meta: { additionalData: {} },
		position,
		children: [],
		relevance: {
			dependencies: [],
			additionalData: {}
		},
		parent: {
			id: ''
		},
		title: '',
		type: 'field'
	} as FormModel['items'][number]
}
