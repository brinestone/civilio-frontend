import { EnvironmentProviders, inject, Injectable } from "@angular/core";
import { FormService } from "@app/services/form.service";
import { FieldMapping } from "@civilio/shared"
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { LoadMappings } from "./actions";
import { from, tap } from "rxjs";
import { patch } from "@ngxs/store/operators";
export * from './actions';

type FormStateModel = {
  mappings: FieldMapping[],
};
export const FORM_STATE = new StateToken<FormStateModel>('form');
type Context = StateContext<FormStateModel>;

@Injectable()
@State({
  name: FORM_STATE,
  defaults: {
    mappings: []
  }
})
class FormState {
  private readonly formService = inject(FormService);
  @Action(LoadMappings)
  onLoadMappings(ctx: Context, { form }: LoadMappings) {
    return from(this.formService.findFieldMappings(form)).pipe(
      tap(mappings => ctx.setState(patch({
        mappings
      })))
    )
  }
}

export function provideFormStore(...features: EnvironmentProviders[]): EnvironmentProviders {
  return provideStates([FormState], ...features);
}
