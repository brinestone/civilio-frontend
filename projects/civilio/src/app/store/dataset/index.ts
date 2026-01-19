import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from "@angular/core";
import { FORM_SERVICE } from "@app/services/form";
import { DatasetGroup, DatasetGroupSchema, UpdateFormOptionsDataSetRequestSchema } from "@civilio/shared";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { DeleteDataset, LoadDatasets, SaveDatasets } from "./actions";
import { patch, removeItem } from "@ngxs/store/operators";
import z from "zod";


export type DatasetStateModel = {
	groups: DatasetGroup[];
};

export * from './actions';
export const DATASET_STATE = new StateToken<DatasetStateModel>('datasets');
type Context = StateContext<DatasetStateModel>;

const mapFormToRequest = (formValue: z.infer<typeof UpdateFormOptionsDataSetRequestSchema>) => {
	return (formValue.groups ?? []).map((group) => {
		const isGroupNew = group.meta.isNew;

		if (isGroupNew) {
			return {
				isNew: true,
				data: {
					title: group.data.title,
					key: group.data.key ?? '',
					description: group.data.description,
					parentId: group.data.parentId,
					options: group.data.options.map((opt) => ({
						label: opt.label,
						value: opt.value,
						ordinal: opt.ordinal,
						i18nKey: opt.i18nKey,
						parentValue: opt.parentValue,
					})),
				},
			};
		} else {
			return {
				isNew: false,
				data: {
					id: group.data.id as string,
					title: group.data.title,
					key: group.data.key ?? undefined,
					description: group.data.description,
					parentId: group.data.parentId,
					options: group.data.options.map((opt) => {
						if (opt.isNew) {
							return {
								isNew: true,
								label: opt.label,
								value: opt.value,
								ordinal: opt.ordinal,
								i18nKey: opt.i18nKey,
								parentValue: opt.parentValue,
							};
						} else {
							return {
								isNew: false,
								id: opt.id as string,
								label: opt.label,
								value: opt.value,
								ordinal: opt.ordinal,
								i18nKey: opt.i18nKey,
								parentValue: opt.parentValue,
							};
						}
					}),
				},
			};
		}
	});
};

@State({
	name: DATASET_STATE,
	defaults: {
		groups: []
	}
})
@Injectable()
class DatasetState {
	private readonly formService = inject(FORM_SERVICE);

	@Action(SaveDatasets)
	async onSaveDatasets(ctx: Context, { payload }: SaveDatasets) {
		await this.formService.saveOptionGroups(payload);
		ctx.dispatch(LoadDatasets);
	}

	@Action(DeleteDataset, { cancelUncompleted: true })
	async onDeleteDataset(ctx: Context, action: DeleteDataset) {
		await this.formService.deleteOptionGroupById(action);
		ctx.setState(patch({
			groups: removeItem(g => g.id == action.id)
		}));
	}

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
