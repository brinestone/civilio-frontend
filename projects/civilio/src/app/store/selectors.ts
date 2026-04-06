import { ValidationErrors } from "@angular/forms";
import { extractRawValidators, lookupFieldSchema } from '@app/model/form';
import { FieldKey, FormSectionKey, FormType, Locale } from "@civilio/shared";
import { createPropertySelectors, createSelector } from "@ngxs/store";
import { entries, get, isEmpty, keys, values } from "lodash";
import { CONFIG_STATE } from "./config";
import { FORM_STATE } from "./form/data";

const configSlices = createPropertySelectors(CONFIG_STATE);
const formSlices = createPropertySelectors(FORM_STATE);

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
export const fontSize = createSelector([configSlices.config], (cfg) => {
	return cfg?.prefs?.fontSize ?? 16;
});
export const facilityName = createSelector([formSlices.rawData], (record) => {
	const facilityNameKeys = [
		'fosa.form.sections.identification.fields.facility_name',
		'csc.form.sections.identification.fields.facility_name',
		'chefferie.form.sections.identification.fields.facility_name',
	] as FieldKey[];

	for (const nameKey of facilityNameKeys) {
		const facilityName = record?.[nameKey];
		if (facilityName) return facilityName as string;
	}

	return null;
});
export const undoAvailable = createSelector([formSlices.undoStack], r => r.length > 0);
export const redoAvailable = createSelector([formSlices.redoStack], r => r.length > 0);

export const changesPending = createSelector([undoAvailable, redoAvailable], (u, r) => {
	return u;
});
export const totalErrorCount = createSelector([formSlices.activeSections], (sections) => {
	return values(sections).map(({ errors }) => keys(errors).length).reduce((acc, curr) => curr + acc, 0);
})
export const migrationNeeded = createSelector([configSlices.migrationState], m => m?.needsMigration === true);
export const dbConfig = createSelector([configSlices.knownConnections], (c) => {
	return c.find(d => d.inUse);
});
export const hasConfiguredConnection = createSelector([configSlices.knownConnections], c => c.some(x => x.inUse))
export const connections = configSlices.knownConnections;
export const preInit = configSlices.preInit;
export const hasValidValidationCode = createSelector([formSlices.activeSections, formSlices.schemas], (sections, schemas) => {
	const validationCodeKeys = [
		['csc.form.sections.extra', 'csc.form.sections.extra.fields.validation_code'],
		['fosa.form.sections.extras', 'fosa.form.fields.validation_code'],
		['chefferie.form.sections.comments', 'chefferie.form.sections.comments.fields.validation_code']
	] as [FormSectionKey, FieldKey][];

	for (const [section, key] of validationCodeKeys) {
		if (!(section in sections)) continue;
		const value = sections[section].model[key]
		const formSchema = schemas[key.split('.', 2)[0]];
		const fieldSchema = lookupFieldSchema(key, formSchema);
		const validators = extractRawValidators(fieldSchema!);
		return validators.reduce((acc, curr) => acc && (curr(value) === null), true);
	}
	return false;
})
export const apiInfo = createSelector([configSlices.config], c => {
	return c?.apiServer;
});
export const apiUrl = createSelector([apiInfo], info => {
	return info ? info.baseUrl : '';
});
export const apiOrigin = createSelector([apiUrl], url => {
	if (url == '') return '';
	return new URL(url).origin;
});
export const uploadUrl = createSelector([apiOrigin], url => `${url}/upload`);
