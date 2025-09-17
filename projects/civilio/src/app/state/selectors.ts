import { createPropertySelectors, createSelector } from "@ngxs/store";
import { CONFIG_STATE } from "./config";

const configSlices = createPropertySelectors(CONFIG_STATE);

export const isConfigValid = configSlices.configured;
export const currentTheme = createSelector([configSlices.config], (config) => {
  return config?.prefs?.theme ?? 'system';
});
export const currentLocale = createSelector([configSlices.config], config => {
  return config?.prefs?.locale ?? navigator.language;
})
