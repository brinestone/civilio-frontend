import { FormType } from "@civilio/shared";
import { createPropertySelectors, createSelector } from "@ngxs/store";
import { CONFIG_STATE } from "./config";
import { FORM_STATE } from "./form";

const configSlices = createPropertySelectors(CONFIG_STATE);
const formSlices = createPropertySelectors(FORM_STATE);

export const isConfigValid = configSlices.configured;
export const currentTheme = createSelector([configSlices.config], (config) => {
  return config?.prefs?.theme ?? 'system';
});
export const currentLocale = createSelector([configSlices.config], config => {
  return config?.prefs?.locale ?? navigator.language;
});
export function optionsSelector(form: FormType, group: string) {
  return createSelector([formSlices.options], options => {
    return options?.[form][group] ?? [];
  })
}
export function fieldMappingsfor(formType: FormType) {
  return createSelector([formSlices.mappings], mappings => {
    return mappings?.[formType];
  })
}

export function dbColumnsFor(form: FormType) {
  return createSelector([formSlices.columns], cols => {
    return cols?.[form] ?? []
  })
}

export const formMappings = formSlices.mappings;
export const formColumns = formSlices.columns;
export const lastFocusedFormType = formSlices.lastFocusedFormType;
