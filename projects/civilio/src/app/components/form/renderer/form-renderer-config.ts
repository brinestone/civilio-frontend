import { FormItemDefinition, FormItemField, FormItemGroup, SubmissionData, TextFieldConfig } from "@civilio/sdk/models";
import { formOptions } from "@tanstack/angular-form";

export const submissionDataFormOptions = formOptions({
	defaultValues: SubmissionData.parse({})
});

const fieldTypesMap = {
	text: TextFieldConfig
} as const;

export function isFieldOrGroupItem(item: FormItemDefinition): item is FormItemField | FormItemGroup {
	return item.type == 'group' || item.type == 'field';
}
