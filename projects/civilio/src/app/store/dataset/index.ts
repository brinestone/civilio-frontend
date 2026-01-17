import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from "@angular/core";
import { FORM_SERVICE } from "@app/services/form";
import { DatasetGroup, DatasetGroupSchema } from "@civilio/shared";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { LoadDatasets } from "./actions";


export type DatasetStateModel = {
	groups: DatasetGroup[];
};

export * from './actions';
export const DATASET_STATE = new StateToken<DatasetStateModel>('datasets');
type Context = StateContext<DatasetStateModel>;

@State({
	name: DATASET_STATE,
	defaults: {
		groups: []
	}
})
@Injectable()
class DatasetState {
	private readonly formService = inject(FORM_SERVICE);
	@Action(LoadDatasets, { cancelUncompleted: true })
	async onLoadDatasets(ctx: Context) {
		const response = await this.formService.loadUngroupedFormOptions();
		ctx.setState({ groups: DatasetGroupSchema.array().parse(response.groups) });
	}
}

export function provideDatasets(...providers: EnvironmentProviders[]) {
	return makeEnvironmentProviders([
		provideStates([DatasetState], ...providers)
	]);
}
