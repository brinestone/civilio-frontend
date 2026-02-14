import { isDevMode, Signal } from "@angular/core";
import { apply, applyEach, applyWhen, applyWhenValue, debounce, disabled, hidden, max, maxLength, min, minLength, required, SchemaPath, SchemaPathTree, validate } from "@angular/forms/signals";
import { FieldItemMetaSchema, NoteItemMetaSchema } from "@app/model/form";
import {NumberRange, BooleanFieldMeta, FormItemDefinition, FormItemField, FormVersionDefinition, GeoPointFieldMeta, MultiDateFieldMeta, NumberFieldMeta, RangeDateFieldMeta, RelevanceCondition, RelevanceCondition_operator, RelevanceLogicExpression, SelectFieldMeta, SimpleDateFieldMeta, TextFieldMeta } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";

export type FormModel = Strict<FormVersionDefinition>;
export type FormItemType = FormModel['items'][number]['type'];
export const pathSeparator = '.';

const debounceDuration = 200;


function defineTextFieldMetaFormSchema(paths: SchemaPathTree<Strict<TextFieldMeta>>) {
	debounce(paths.pattern, debounceDuration);
	debounce(paths.maxlength, debounceDuration);
	debounce(paths.minlength, debounceDuration);
	debounce(paths.defaultValue, debounceDuration);

	min(paths.minlength, 0);
	hidden(paths.maxlength, ({ valueOf }) => valueOf(paths.readonly) === true);
	hidden(paths.minlength, ({ valueOf }) => valueOf(paths.readonly) === true);
	hidden(paths.pattern, ({ valueOf }) => valueOf(paths.readonly) === true);
	validate(paths.pattern, ({ value, valueOf }) => {
		const currentValue = value();
		if (!currentValue) return null;
		try {
			new RegExp(currentValue, valueOf(paths.type) == 'multiline' ? 'm' : undefined);
			return null;
		} catch {
			return { message: 'Invalid regular expression', kind: 'badRegex' };
		}
	});
	validate(paths.maxlength, ({ valueOf, value }) => {
		const minlength = Number(valueOf(paths.minlength) ?? undefined);
		const currentValue = Number(value() ?? undefined);
		if (!minlength || !currentValue) return null;
		else if (currentValue - minlength <= 0) return { kind: 'rangeError', message: 'The maximum length cannot be less than or equal to the minimum length' }
		return null;
	});
	validate(paths.minlength, ({ valueOf, value }) => {
		const maxlength = Number(valueOf(paths.maxlength) ?? undefined);
		const currentValue = Number(value() ?? undefined);
		if (!maxlength || !currentValue) return null;
		else if (maxlength - currentValue <= 0) return { kind: 'rangeError', message: 'The minimum length cannot be greater than or equal to the maximum length' }
		return null;
	})
	required(paths.defaultValue, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required' });
	applyWhen(paths.defaultValue, ({ valueOf, stateOf }) => !!valueOf(paths.maxlength) && !stateOf(paths.maxlength).hidden() && stateOf(paths.maxlength).valid(), p => {
		maxLength(p as SchemaPath<string, 1>, ({ valueOf }) => Number(valueOf(paths.maxlength)), { message: ({ valueOf }) => `Value cannot have more than ${valueOf(paths.maxlength)} characters` });
	});
	applyWhen(paths.defaultValue, ({ valueOf, stateOf }) => !!valueOf(paths.minlength) && !stateOf(paths.minlength).hidden() && stateOf(paths.minlength).valid(), p => {
		minLength(p as SchemaPath<string, 1>, ({ valueOf }) => Number(valueOf(paths.minlength)), { message: ({ valueOf }) => `Value cannot have less than ${valueOf(paths.minlength)} characters` })
	});
}
function defineGeopointFieldMetaFormSchema(paths: SchemaPathTree<Strict<GeoPointFieldMeta>>) {
	required(paths.defaultValue, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is marked readonly' });
}
function defineDateFieldMetaFormSchema(paths: SchemaPathTree<Strict<SimpleDateFieldMeta>>) {
	max(paths.min, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'The minimum date must be a date before the maximum date' });
	min(paths.max, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'The maximum date must be a date after the minimum date' });
	min(paths.defaultValue, ({ valueOf }) => valueOf(paths.min)?.valueOf() ?? undefined, { message: 'Value must be a date after or on the minimum date' })
	max(paths.defaultValue, ({ valueOf }) => valueOf(paths.max)?.valueOf() ?? undefined, { message: 'Value must be a date before or on the minimum date' })
	required(paths.defaultValue, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when field is marked readonly' });
}
function defineRangeDateFieldMetaFormSchema(paths: SchemaPathTree<Strict<RangeDateFieldMeta>>) {
	applyWhenValue(paths.defaultValue, (v) => !!v, (innerPaths) => {
		min(innerPaths.start, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'The start date must be on or after the minimum date', });
		max(innerPaths.start, ({ valueOf }) => valueOf(innerPaths.end) ?? undefined, { message: 'The start date must be on or before the end date' });

		min(innerPaths.end, ({ valueOf }) => valueOf(innerPaths.start) ?? undefined, { message: 'The end date must be on or after the start date' });
		max(innerPaths.end, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'The end date must be on or before the maximum date' });
		required(innerPaths.end, { message: 'The end date is required' });
		required(innerPaths.start, { message: 'The start date is required' });
	});
	max(paths.min, ({ valueOf }) => {
		const max = valueOf(paths.max);
		if (max === null) return undefined;
		return max - 60000;
	}, { message: 'The minimum date must be a date before the maximum date' });
	min(paths.max, ({ valueOf }) => {
		const min = valueOf(paths.min);
		if (min === null) return undefined;
		return min + 60000;
	}, { message: 'The maximum date must be a date after the minimum date' });
	required(paths.defaultValue, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is readonly' });
	min(paths.defaultValue as any, ({ valueOf }) => valueOf(paths.min) ?? undefined);
	max(paths.defaultValue as any, ({ valueOf }) => valueOf(paths.max) ?? undefined);
}
function defineMultiDateFieldMetaFormSchema(paths: SchemaPathTree<Strict<MultiDateFieldMeta>>) {
	max(paths.min, ({ valueOf }) => {
		const max = valueOf(paths.max);
		if (max === null) return undefined;
		return max - 60000;
	}, { message: 'The minimum date must be before the maximum' });
	min(paths.max, ({ valueOf }) => {
		const min = valueOf(paths.min);
		if (min === null) return undefined;
		return min + 60000;
	}, { message: 'The maximum date must be before the minimum' });
	required(paths.defaultValue, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is readonly' });
	minLength(paths.defaultValue as SchemaPath<number[]>, ({ valueOf }) => valueOf(paths.readonly) ? 1 : undefined, { message: 'At least one selection must be made when field is readonly' });
	applyWhenValue(paths.defaultValue, v => (v?.length ?? 0) > 0, schema => {
		applyEach(schema as SchemaPath<number[]>, s => {
			min(s, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'All selected dates must be after the minimum date' });
			max(s, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'All selected dates must be before the maximum date' });
		});
		maxLength(schema as SchemaPath<number[]>, ({ valueOf }) => valueOf(paths.maxSelection) ?? undefined, { message: ({ valueOf }) => `At most ${valueOf(paths.maxSelection)} date${valueOf(paths.maxSelection) != 1 ? 's' : ''} can be selected` });
		minLength(schema as SchemaPath<number[]>, ({ valueOf }) => valueOf(paths.minSelection) ?? undefined, { message: ({ valueOf }) => `At least ${valueOf(paths.minSelection)} date${valueOf(paths.minSelection) != 1 ? 's' : ''} should be selected` });
	});

	min(paths.minSelection, 0, { message: 'Value cannot be less than zero' });
	max(paths.minSelection, ({ valueOf }) => valueOf(paths.maxSelection) ?? undefined, { message: ({ valueOf }) => `Value cannot be greater than ${valueOf(paths.maxSelection)}` });
	min(paths.maxSelection, ({ valueOf }) => valueOf(paths.minSelection) ?? undefined, { message: ({ valueOf }) => `Value cannot be less than ${valueOf(paths.minSelection)}` });

}
function defineNumberFieldMetaFormSchema(paths: SchemaPathTree<Strict<NumberFieldMeta>>) {
	min(paths.max, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'The maximum value cannot be less than the minimum value' });
	max(paths.min, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'The minimum value cannot be greater than the maximum value' });
	min(paths.defaultValue, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: ({ valueOf }) => `Value cannot be less than ${valueOf(paths.min)}` });
	max(paths.defaultValue, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: ({ valueOf }) => `Value cannot be greater than ${valueOf(paths.max)}` });
	required(paths.defaultValue, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is readonly' })
}
function defineSelectionFieldMetaFormSchema(paths: SchemaPathTree<Strict<SelectFieldMeta>>) {
	hidden(paths.optionSourceRef, () => true);
	applyEach(paths.hardOptions, innerPaths => {
		debounce(innerPaths.label, debounceDuration);
		debounce(innerPaths.value, debounceDuration);

		required(innerPaths.label, { message: 'A label is required' });
		// required(innerPaths.value, { message: 'A value is required' });
	});

	required(paths.defaultValue, {
		when: ({ valueOf, stateOf }) => valueOf(paths.readonly) === true,
		message: 'A default value is required when readonly is enabled'
	});
	disabled(paths.defaultValue, ({ valueOf, stateOf }) => (valueOf(paths.optionSourceRef) === null || stateOf(paths.optionSourceRef).invalid()) && (stateOf(paths.hardOptions).invalid() || (valueOf(paths.hardOptions) ?? []).length == 0));
}
function defineBooleanFieldMetaFormSchema(paths: SchemaPathTree<Strict<BooleanFieldMeta>>) {

}

function defineFormItemDefinitionFormSchema(paths: SchemaPathTree<Strict<FormItemDefinition>>) {

	applyWhen(paths, ({ value }) => value().type == 'field', paths => {
		const fp = paths as unknown as SchemaPathTree<Strict<FormItemField>>;
		debounce(fp.title, debounceDuration);
		required(fp.title, { message: 'A title is required' });

		debounce(fp.description, debounceDuration);
		hidden(fp.id, () => true);
		hidden(fp.path, () => true);
		hidden(fp.type, () => true);

		apply(fp.meta, meta => {
			required(meta.type, { message: 'A field type must be specified' });
			hidden(meta.required, ({ valueOf }) => valueOf(meta.readonly) === true);

			const isText = (v: FormItemField['meta']): v is Strict<TextFieldMeta> => v?.type == 'text' || v?.type == 'multiline';
			const isBoolean = (v: FormItemField['meta']): v is Strict<BooleanFieldMeta> => v?.type === 'boolean';
			const isGeo = (v: FormItemField['meta']): v is Strict<GeoPointFieldMeta> => v?.type === 'geo-point';
			const isDate = (v: FormItemField['meta']): v is Strict<SimpleDateFieldMeta> => v?.type === 'date' || v?.type === 'date-time';
			const isNumber = (v: FormItemField['meta']): v is Strict<NumberFieldMeta> => v?.type == 'float' || v?.type === 'integer';
			const isSelection = (v: FormItemField['meta']): v is Strict<SelectFieldMeta> => v?.type == 'single-select' || v?.type == 'multi-select';
			const isDateRange = (v: FormItemField['meta']): v is Strict<RangeDateFieldMeta> => v?.type == 'date-range';
			const isMultiDate = (v: FormItemField['meta']): v is Strict<MultiDateFieldMeta> => v?.type == 'multi-date';
			applyWhenValue(meta, isText, defineTextFieldMetaFormSchema);
			applyWhenValue(meta, isBoolean, defineBooleanFieldMetaFormSchema);
			applyWhenValue(meta, isGeo, defineGeopointFieldMetaFormSchema);
			applyWhenValue(meta, isDate, defineDateFieldMetaFormSchema);
			applyWhenValue(meta, isNumber, defineNumberFieldMetaFormSchema);
			applyWhenValue(meta, isSelection, defineSelectionFieldMetaFormSchema);
			applyWhenValue(meta, isDateRange, defineRangeDateFieldMetaFormSchema);
			applyWhenValue(meta, isMultiDate, defineMultiDateFieldMetaFormSchema);
		})
	});
}

export function defineFormDefinitionFormSchema(options: {
	enableEditing: Signal<boolean>
}) {
	return (paths: SchemaPathTree<ReturnType<typeof defaultFormDefinitionSchemaValue>>) => {
		hidden(paths.id, () => true);
		hidden(paths.parentId, () => true);
		applyEach(paths.items, defineFormItemDefinitionFormSchema);
	}
}

export function domainToStrictFormDefinition(value: FormVersionDefinition) {
	return value as FormModel;
}
export function defaultFormItemDefinitionSchemaValue(path: string, type: FormItemType) {
	const meta = formItemDefaultMeta(type);
	const result = {
		description: '',
		id: '',
		meta,
		path,
		children: [],
		relevance: {
			enabled: isDevMode(),
			logic: []
		},
		parent: {
			id: ''
		},
		title: '',
		type
	} as FormModel['items'][number];
	return result;
}
export function defaultFormDefinitionSchemaValue() {
	return {
		id: 'new',
		parentId: '',
		items: isDevMode() ? [defaultFormItemDefinitionSchemaValue('0', 'field')] : [], // TODO: Remove this in prod and make an empty array instead
	} as FormModel
}

export function formItemDefaultMeta(type: FormItemType) {
	switch (type) {
		case 'field': return FieldItemMetaSchema.parse({ type: isDevMode() ? 'text' : 'text' });
		case 'note': return NoteItemMetaSchema.parse({ fontSize: 13 })
		default: throw new Error('Unknown form item type')
	}
}

export function defaultRelevanceExpression() {
	return {
		field: null,
		operator: 'eq',
		value: null
	} as RelevanceLogicExpression;
}

export function defaultRelevanceLogic(operator: RelevanceCondition_operator = 'and') {
	return {
		expressions: [defaultRelevanceExpression()],
		operator
	} as Strict<RelevanceCondition>
}
