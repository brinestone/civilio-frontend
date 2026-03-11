import { FormItem, FormItemSchemaContext } from "./items";

export interface FormItemSettingsSection<T extends FormItem> {
	ctx: FormItemSchemaContext<T>;
}
