import { FormSectionKey, FormType, Locale } from "@civilio/shared";
import { createPropertySelectors, createSelector } from "@ngxs/store";
import { entries } from "lodash";
import { CONFIG_STATE } from "./config";
import { FORM_STATE } from "./form";

const configSlices = createPropertySelectors(CONFIG_STATE);
const formSlices = createPropertySelectors(FORM_STATE);

export const isConfigValid = configSlices.configured;
export const currentTheme = createSelector([configSlices.config], (config) => {
	return config?.prefs?.theme ?? 'system';
});
export const currentLocale = createSelector([configSlices.config], config => {
	return config?.prefs?.locale ?? navigator.language as Locale;
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

export function sectionValue(section: string) {
	return createSelector([formSlices.activeSections], sections => {
		return sections[section]?.model ?? {};
	})
}

export function rawData(section: FormSectionKey) {
	return createSelector([formSlices.rawData], data => {
		const selectedEntries = entries(data ?? {}).filter(([k]) => k.startsWith(section));
		return Object.fromEntries(selectedEntries);
	})
}
export const sectionValidity = createSelector([formSlices.activeSections], sections => {
	const _entries = entries(sections).map(([k, { status }]) => [k, status])
	return Object.fromEntries(_entries);
});

export const formMappings = formSlices.mappings;
export const formColumns = formSlices.columns;
export const lastFocusedFormType = formSlices.lastFocusedFormType;
export const relevanceRegistry = formSlices.relevanceRegistry;
export const activeSections = formSlices.activeSections;
