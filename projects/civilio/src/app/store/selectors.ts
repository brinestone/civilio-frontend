import { createPropertySelectors, createSelector } from "@ngxs/store";
import { CONFIG_STATE } from "./config";
import { FormType } from "@civilio/shared";
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
export function fieldMappingsfor(formType: FormType) {
  return createSelector([formSlices.mappings], mappings => {
    return mappings.filter(({ form }) => formType == form);
  })
}
