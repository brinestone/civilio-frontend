import { EnvironmentProviders, Injectable } from '@angular/core';
import { provideStates, State, StateToken } from '@ngxs/store';

export type FormSchemaStateModel = {}

export const FORM_SCHEMA = new StateToken<FormSchemaStateModel>('formSchema')

@Injectable()
@State({
	name: FORM_SCHEMA,
	defaults: {
	}
})
class FormDefinitionState {

}

export function provideFormDefinitions(...features: EnvironmentProviders[]) {
	return provideStates([FormDefinitionState], ...features)
}
