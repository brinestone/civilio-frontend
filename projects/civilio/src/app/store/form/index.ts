import { EnvironmentProviders, inject, Injectable } from "@angular/core";
import { FormService } from "@app/services/form.service";
import { FieldMapping, FindDbColumnsResponse, FindFormOptionsResponse, FormType } from "@civilio/shared";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { insertItem, patch } from "@ngxs/store/operators";
import { EMPTY, from, tap } from "rxjs";
import { LoadDbColumns, LoadMappings, LoadOptions, UpdateMappings } from "./actions";
export * from './actions';

type FormStateModel = {
  mappings?: Record<FormType, Record<string, FieldMapping>>;
  options?: Record<FormType, FindFormOptionsResponse>;
  columns?: Record<FormType, FindDbColumnsResponse>;
};
export const FORM_STATE = new StateToken<FormStateModel>('form');
type Context = StateContext<FormStateModel>;

@Injectable()
@State({
  name: FORM_STATE,
  defaults: {
  }
})
class FormState {
  private readonly formService = inject(FormService);

  @Action(UpdateMappings)
  onUpdateMappings(ctx: Context, { form, mappings }: UpdateMappings) {
    return from(this.formService.updateFieldMappings(form, ...mappings)).pipe(
      tap(result => ctx.setState(patch({
        mappings: patch({
          [form]: patch(result.reduce((acc, curr) => {
            return { ...acc, [curr.field]: curr };
          }, {} as Record<string, FieldMapping>))
        })
      })))
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
