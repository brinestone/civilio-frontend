import { Injectable, makeEnvironmentProviders } from "@angular/core";
import { FormItem } from "@db/schemas";
import { LOCAL_STORAGE_ENGINE, withStorageFeature } from "@ngxs/storage-plugin";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { AddFormItem } from "./actions";
import { append, patch } from "@ngxs/store/operators";

export * from "./actions";

export type FormStateModel = {
	pendingItems: FormItem[];
}
export const FORMS = new StateToken<FormStateModel>('forms');
type Context = StateContext<FormStateModel>;


@Injectable()
@State({
	name: FORMS,
	defaults: {
		pendingItems: []
	}
})
class FormState {
	@Action(AddFormItem)
	onAddFormItem(ctx: Context, { formVersion, type, parentId }: AddFormItem) {
		ctx.setState(patch({
			pendingItems: append([
				FormItem.parse({ type, formVersion, parentId })
			])
		}))
	}
}

export function provideFormStore() {
	return makeEnvironmentProviders([
		provideStates([FormState], withStorageFeature([
			{
				engine: LOCAL_STORAGE_ENGINE,
				key: FORMS
			}
		]))
	]);
}
