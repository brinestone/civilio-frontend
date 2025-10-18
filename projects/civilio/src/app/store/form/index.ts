import { EnvironmentProviders, inject, Injectable } from "@angular/core";
import { FORM_SERVICE } from "@app/services/form";
import { FieldMapping, FindDbColumnsResponse, FindFormOptionsResponse, FormType } from "@civilio/shared";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { EMPTY, from, tap } from "rxjs";
import { LoadDbColumns, LoadMappings, LoadOptions, RemoveMapping, SetFormType, UpdateMappings } from "./actions";
export * from './actions';

type FormStateModel = {
	mappings?: Record<FormType, Record<string, FieldMapping>>;
	options?: Record<FormType, FindFormOptionsResponse>;
	columns?: Record<FormType, FindDbColumnsResponse>;
	lastFocusedFormType: FormType;
};
export const FORM_STATE = new StateToken<FormStateModel>('form');
type Context = StateContext<FormStateModel>;

@Injectable()
@State({
	name: FORM_STATE,
	defaults: {
		lastFocusedFormType: 'csc'
	}
})
class FormState {
	private readonly formService = inject(FORM_SERVICE);

	@Action(RemoveMapping)
	onRemoveMapping(ctx: Context, arg: RemoveMapping) {
		return from(this.formService.removeMapping(arg)).pipe(
			tap(v => {
				const mappings = ctx.getState().mappings;
				if (!mappings) return;
				if (!v) return;
				delete mappings[arg.form][arg.field];
				ctx.setState(patch({
					mappings
				}));
			})
		)
	}

	@Action(SetFormType)
	onSetFormType(ctx: Context, { form }: SetFormType) {
		ctx.setState(patch({
			lastFocusedFormType: form
		}));
	}

	@Action(UpdateMappings)
	onUpdateMappings(ctx: Context, { form, mappings }: UpdateMappings) {
		return from(this.formService.updateFieldMappings(form, ...mappings)).pipe(
			tap(result => {
				const obj = result.reduce((acc, curr) => {
					return { ...acc, [curr.field]: curr };
				}, {});
				ctx.setState(patch({
					mappings: patch({
						[form]: patch(obj)
					})
				}));
			})
		)
	}
	@Action(LoadDbColumns)
	onLoadDbColumns(ctx: Context, { form }: LoadDbColumns) {
		if (ctx.getState().columns?.[form] !== undefined) {
			return EMPTY;
		}
		return from(this.formService.loadDbColumnSpecsFor(form)).pipe(
			tap(specs => ctx.setState(patch({
				columns: patch({
					[form]: specs
				})
			})))
		)
	}

	@Action(LoadOptions)
	onLoadOptions(ctx: Context, { form }: LoadOptions) {
		if (ctx.getState().options?.[form] !== undefined) {
			return EMPTY;
		}
		return from(this.formService.loadFormOptionsFor(form)).pipe(
			tap(options => ctx.setState(patch({
				options: patch({
					[form]: options
				})
			})))
		)
	}

	@Action(LoadMappings)
	onLoadMappings(ctx: Context, { form }: LoadMappings) {
		return from(this.formService.findFieldMappings(form)).pipe(
			tap((mappings) => {
				for (const mapping of mappings) {
					ctx.setState(patch({
						mappings: patch({
							[form]: patch({
								[mapping.field]: mapping
							})
						})
					}))
				}
			})
		)
	}
}

export function provideFormStore(...features: EnvironmentProviders[]): EnvironmentProviders {
	return provideStates([FormState], ...features);
}
