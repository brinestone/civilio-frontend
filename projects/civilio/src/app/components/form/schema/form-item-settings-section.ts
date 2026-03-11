import { FormItem, FormItemDesignerContext } from "./items";

export interface FormItemSettingsSection<T extends FormItem> {
	ctx: FormItemDesignerContext<T>;
}
