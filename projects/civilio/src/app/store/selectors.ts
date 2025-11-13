import { FieldKey, FormSectionKey, FormType, Locale } from "@civilio/shared";
import { createPropertySelectors, createSelector } from "@ngxs/store";
import { entries, get, isEmpty } from "lodash";
import { CONFIG_STATE } from "./config";
import { FORM_STATE } from "./form";
import { ValidationErrors } from "@angular/forms";

const configSlices = createPropertySelectors(CONFIG_STATE);
const formSlices = createPropertySelectors(FORM_STATE);

export const isConfigValid = configSlices.configured;
export const currentTheme = createSelector([configSlices.config], (config) => {
	return config?.prefs?.theme ?? "system";
});
export const currentLocale = createSelector([configSlices.config], (config) => {
	return config?.prefs?.locale ?? (navigator.language as Locale);
});

export function optionsSelector(form: FormType) {
	return createSelector([formSlices.options], (options) => {
		return options?.[form] ?? {};
	});
}

export function fieldMappingsfor(formType: FormType) {
	return createSelector([formSlices.mappings], (mappings) => {
		return mappings?.[formType];
	});
}

export function dbColumnsFor(form: FormType) {
	return createSelector([formSlices.columns], (cols) => {
		return cols?.[form] ?? [];
	});
}

export function sectionValue(section: string) {
	return createSelector([formSlices.activeSections], (sections) => {
		return sections[section]?.model ?? {};
	});
}

export function rawData(section: FormSectionKey) {
	return createSelector([formSlices.rawData], (data) => {
		const selectedEntries = entries(data ?? {}).filter(([k]) =>
			k.startsWith(section),
		);
		return Object.fromEntries(selectedEntries);
	});
}

export const sectionValidity = createSelector(
	[formSlices.activeSections],
	(sections) => {
		const _entries = entries(sections).map(([k, { status }]) => [k, status]);
		return Object.fromEntries(_entries);
	},
);

export const allSectionErrors = createSelector([formSlices.activeSections], (sections) => {
	return entries(sections)
		.filter(([_, form]) => !isEmpty(form.errors))
		.reduce((acc, [k, form]) => ({
			...acc,
			[k]: form.errors
		}), {} as Record<string, Record<string, ValidationErrors | null>>)
})

export const currentSectionErrors = createSelector(
	[formSlices.activeSections, formSlices.currentSection],
	(activeSections, currentSection) => {
		if (!currentSection) return {};
		return activeSections[currentSection]?.errors ?? {};
	},
);

export function miscConfig<T = unknown>(path: string) {
	return createSelector([configSlices.config], (config) => {
		return get(config?.misc, path) as T | undefined;
	})
}

export const formMappings = formSlices.mappings;
export const formColumns = formSlices.columns;
export const lastFocusedFormType = formSlices.lastFocusedFormType;
export const relevanceRegistry = formSlices.relevanceRegistry;
export const activeSections = formSlices.activeSections;
export const currentFormSection = formSlices.currentSection;
export const fontSize = createSelector([configSlices.config], (cfg) => {
	return cfg?.prefs?.fontSize ?? 16;
});
export const facilityName = createSelector([formSlices.rawData], (record) => {
	const facilityNameKeys = [
		 'fosa.form.sections.identification.fields.facility_name',
		'csc.form.sections.identification.fields.facility_name'
		// TODO: add for chefferie
	] as FieldKey[];

	for (const nameKey of facilityNameKeys) {
		const facilityName = record?.[nameKey];
		if (facilityName) return facilityName as string;
	}

	return null;
})
