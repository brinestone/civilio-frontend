import { FormSectionKey, FormType } from "@civilio/shared";
import { createPropertySelectors, createSelector } from "@ngxs/store";
import { CONFIG_STATE } from "./config";
import { FORM_STATE } from "./form";
import { entries, toPlainObject } from "lodash";

const configSlices = createPropertySelectors(CONFIG_STATE);
const formSlices = createPropertySelectors(FORM_STATE);

export const isConfigValid = configSlices.configured;
export const currentTheme = createSelector([configSlices.config], (config) => {
	return config?.prefs?.theme ?? 'system';
});
export const currentLocale = createSelector([configSlices.config], config => {
	return config?.prefs?.locale ?? navigator.language;
});
export function optionsSelector(form: FormType) {
	return createSelector([formSlices.options], options => {
		return options?.[form] ?? {}
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

export function rawData(section: FormSectionKey) {
	return createSelector([formSlices.rawData], data => {
		const selectedEntries = entries(data?.[section] ?? {}).filter(([k]) => k.startsWith(section));
		const result = Object.fromEntries(selectedEntries);
		debugger;
		return result;
	})
}
export const sectionValidity = createSelector([formSlices.activeSections], sections => {
	const _entries = entries(sections).map(([k, { status }]) => [k.replaceAll('_', '.'), status] as [string, 'VALID' | 'INVALID'])
	return Object.fromEntries(_entries);
});

export const formMappings = formSlices.mappings;
export const formColumns = formSlices.columns;
export const lastFocusedFormType = formSlices.lastFocusedFormType;
export const relevanceRegistry = formSlices.relevanceRegistry;
