import { FormItemDefinition, NewFormItemDefinition } from "@civilio/sdk/models";
import { FormItemDesignerContext } from "./items";

export interface FormItemSettingsSection<
	T extends FormItemDefinition | NewFormItemDefinition,
> {
	ctx: FormItemDesignerContext<T>;
}
