import { FormItemDefinition, FormItemField, FormItemGroup, TextFieldConfig } from "@civilio/sdk/models";


const fieldTypesMap = {
	text: TextFieldConfig
} as const;

export function isFieldOrGroupItem(item: FormItemDefinition): item is FormItemField | FormItemGroup {
	return item.type == 'group' || item.type == 'field';
}
