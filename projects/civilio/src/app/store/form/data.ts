import { EnvironmentProviders, Injectable } from "@angular/core";
import { ValidationErrors } from "@angular/forms";
import {
	FormSchema,
	lookupFieldSchema,
	ParsedValue,
	RelevanceDefinition
} from "@app/model/form";
import {
	FieldKey,
	FieldMapping,
	FindDbColumnsResponse,
	FindFormOptionsResponse,
	FormSectionKey,
	FormType
} from "@civilio/shared";
import {
	provideStates,
	State,
	StateContext,
	StateToken
} from "@ngxs/store";

type FormStateModel = {

};
export const FORM_STATE = new StateToken<FormStateModel>("form");
type Context = StateContext<FormStateModel>;

@Injectable()
@State({
	name: FORM_STATE,
	defaults: {
		lastFocusedFormType: "csc",
		activeSections: {},
		schemas: {},
		relevanceRegistry: {},
		undoStack: [],
		redoStack: []
	},
})
class FormDataState {
}

export function provideFormStore(
	...features: EnvironmentProviders[]
): EnvironmentProviders {
	return provideStates([FormDataState], ...features);
}
