import { isDevMode, Signal } from "@angular/core";
import { apply, applyEach, applyWhen, applyWhenValue, debounce, disabled, hidden, max, maxLength, min, minLength, required, RequiredValidationError, SchemaPath, SchemaPathTree, validate, ValidationError } from "@angular/forms/signals";
import { DateRange, FieldItemMeta, FieldItemMetaSchema, NoteItemMetaSchema, } from "@app/model/form";
import { FormItemDefinition, FormVersionDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { last } from "lodash";

export type FormModel = Strict<FormVersionDefinition>;
export type FormItemType = FormModel['items'][number]['type'];

const debounceDuration = 200;

function defineTextFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'text' | 'multiline' }>>) {
	debounce(paths.pattern, debounceDuration);
	debounce(paths.maxlength, debounceDuration);
	debounce(paths.minlength, debounceDuration);
	debounce(paths.default, debounceDuration);

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
	required(paths.default, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required' });
	applyWhen(paths.default, ({ valueOf, stateOf }) => !!valueOf(paths.maxlength) && !stateOf(paths.maxlength).hidden() && stateOf(paths.maxlength).valid(), p => {
		maxLength(p as SchemaPath<string, 1>, ({ valueOf }) => Number(valueOf(paths.maxlength)), { message: ({ valueOf }) => `Value cannot have more than ${valueOf(paths.maxlength)} characters` });
	});
	applyWhen(paths.default, ({ valueOf, stateOf }) => !!valueOf(paths.minlength) && !stateOf(paths.minlength).hidden() && stateOf(paths.minlength).valid(), p => {
		minLength(p as SchemaPath<string, 1>, ({ valueOf }) => Number(valueOf(paths.minlength)), { message: ({ valueOf }) => `Value cannot have less than ${valueOf(paths.minlength)} characters` })
	});
}
function defineGeopointFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'geo-point' }>>) {
	required(paths.default, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is marked readonly' });
}
function defineDateFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'date-time' | 'date' }>>) {
	max(paths.min, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'The minimum date must be a date before the maximum date' });
	min(paths.max, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'The maximum date must be a date after the minimum date' });
	min(paths.default, ({ valueOf }) => valueOf(paths.min)?.valueOf() ?? undefined, { message: 'Value must be a date after or on the minimum date' })
	max(paths.default, ({ valueOf }) => valueOf(paths.max)?.valueOf() ?? undefined, { message: 'Value must be a date before or on the minimum date' })
	required(paths.default, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when field is marked readonly' });
}
function defineRangeDateFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'date-range' }>>) {
	applyWhenValue(paths.default, (v) => !!v, (innerPaths: SchemaPathTree<DateRange>) => {
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
	required(paths.default, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is readonly' });
	min(paths.default as any, ({ valueOf }) => valueOf(paths.min) ?? undefined);
	max(paths.default as any, ({ valueOf }) => valueOf(paths.max) ?? undefined);
}
function defineMultiDateFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'multi-date' }>>) {
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
	required(paths.default, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is readonly' });
	minLength(paths.default as SchemaPath<number[]>, ({ valueOf }) => valueOf(paths.readonly) ? 1 : undefined, { message: 'At least one selection must be made when field is readonly' });
	applyWhenValue(paths.default, v => (v?.length ?? 0) > 0, schema => {
		applyEach(schema as SchemaPath<number[]>, s => {
			min(s, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'All selected dates must be the same date as or after the minimum date' });
			max(s, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'All selected dates must be the same date as or before the maximum date' });
		});
		maxLength(schema as SchemaPath<number[]>, ({ valueOf }) => valueOf(paths.maxSelection) ?? undefined, { message: ({ valueOf }) => `At most ${valueOf(paths.maxSelection)} date${valueOf(paths.maxSelection) != 1 ? 's' : ''} can be selected` });
		minLength(schema as SchemaPath<number[]>, ({ valueOf }) => valueOf(paths.minSelection) ?? undefined, { message: ({ valueOf }) => `At least ${valueOf(paths.minSelection)} date${valueOf(paths.minSelection) != 1 ? 's' : ''} should be selected` });
	});

	min(paths.minSelection, 0, { message: 'Value cannot be less than zero' });
	max(paths.minSelection, ({ valueOf }) => valueOf(paths.maxSelection) ?? undefined, { message: ({ valueOf }) => `Value cannot be greater than ${valueOf(paths.maxSelection)}` });
	min(paths.maxSelection, ({ valueOf }) => valueOf(paths.minSelection) ?? undefined, { message: ({ valueOf }) => `Value cannot be less than ${valueOf(paths.minSelection)}` });

}
function defineNumberFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'float' | 'integer' }>>) {
	min(paths.max, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: 'The maximum value cannot be less than the minimum value' });
	max(paths.min, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: 'The minimum value cannot be greater than the maximum value' });
	min(paths.default, ({ valueOf }) => valueOf(paths.min) ?? undefined, { message: ({ valueOf }) => `Value cannot be less than ${valueOf(paths.min)}` });
	max(paths.default, ({ valueOf }) => valueOf(paths.max) ?? undefined, { message: ({ valueOf }) => `Value cannot be greater than ${valueOf(paths.max)}` });
	required(paths.default, { when: ({ valueOf }) => valueOf(paths.readonly) === true, message: 'A default value is required when the field is readonly' })
}
function defineSelectionFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'single-select' | 'multi-select' }>>) {
	hidden(paths.optionSourceRef, () => true);
	applyEach(paths.hardOptions, innerPaths => {
		debounce(innerPaths.label, debounceDuration);
		debounce(innerPaths.value, debounceDuration);

		required(innerPaths.label, { message: 'A label is required' });
		required(innerPaths.value, { message: 'A value is required' });
	});

	required(paths.default, {
		when: ({ valueOf, stateOf }) => valueOf(paths.readonly) === true,
		message: 'A default value is required when readonly is enabled'
	});
	disabled(paths.default, ({ valueOf, stateOf }) => (valueOf(paths.optionSourceRef) === null || stateOf(paths.optionSourceRef).invalid()) && (stateOf(paths.hardOptions).invalid() || (valueOf(paths.hardOptions) ?? []).length == 0));
}
function defineBooleanFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'boolean' }>>) {

}

function defineFormItemDefinitionFormSchema(paths: SchemaPathTree<Strict<FormItemDefinition>>) {
	// title
	debounce(paths.title, debounceDuration);
	required(paths.title, { message: 'A title is required', when: ({ valueOf }) => (['field', 'group', 'list'] as FormItemType[]).includes(valueOf(paths.type)) });

	// description
	debounce(paths.description, debounceDuration);

	// id
	hidden(paths.id, () => true);

	// meta
	hidden(paths.meta, ({ valueOf }) => valueOf(paths.type) != 'field');
	apply(paths.meta.additionalData, innerPaths => {
		const fieldPaths = innerPaths as unknown as SchemaPathTree<FieldItemMeta>;
		required(fieldPaths.type, { when: ({ valueOf }) => valueOf(paths.type) === 'field' });
		hidden(fieldPaths.required, ({ valueOf }) => {
			const ref = valueOf(fieldPaths.readonly);
			return ref === true;
		});

		// 1. Define Type Guards to satisfy the "is" requirement
		const isText = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'text' | 'multiline' }> => v.type === 'text' || v.type === 'multiline';
		const isBoolean = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'boolean' }> => v.type === 'boolean';
		const isGeo = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'geo-point' }> => v.type === 'geo-point';
		const isDate = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'date' | 'date-time' }> =>
			v.type === 'date' || v.type === 'date-time';
		const isDateRange = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'date-range' }> => v.type === 'date-range';
		const isMultiDate = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'multi-date' }> => v.type === 'multi-date';
		const isNumber = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'float' | 'integer' }> => v.type === 'integer' || v.type === 'float';
		const isSelection = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'single-select' | 'multi-select' }> => v.type === 'multi-select' || v.type === 'single-select';


		applyWhenValue(fieldPaths, isText, defineTextFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isGeo, defineGeopointFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isDate, defineDateFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isBoolean, defineBooleanFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isNumber, defineNumberFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isSelection, defineSelectionFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isDateRange, defineRangeDateFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isMultiDate, defineMultiDateFieldMetaFormSchema);
	});

	// position
	hidden(paths.position, () => true);

	// type
	required(paths.type, { message: 'A type is required' });
}

export function defineFormDefinitionFormSchema(options: {
	enableEditing: Signal<boolean>
}) {
	return (paths: SchemaPathTree<ReturnType<typeof defaultFormDefinitionSchemaValue>>) => {
		hidden(paths.id, () => true);
		hidden(paths.parentId, () => true);
		applyEach(paths.items, defineFormItemDefinitionFormSchema as any);
	}
}

export function domainToStrictFormDefinition(value: FormVersionDefinition) {
	return value as FormModel;
}
export function defaultFormItemDefinitionSchemaValue(position: number, type: FormItemType) {
	const meta = formItemDefaultMeta(type);
	const result = {
		description: '',
		id: '',
		meta: { additionalData: meta },
		position,
		children: [],
		relevance: {
			enabled: isDevMode(),
			dependencies: [],
			logic: { additionalData: {} }
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
		id: '',
		parentId: '',
		items: isDevMode() ? [defaultFormItemDefinitionSchemaValue(0, 'field')] : [], // TODO: Remove this in prod and make an empty array instead
	} as FormModel
}

export function formItemDefaultMeta(type: FormItemType) {
	switch (type) {
		case 'field': return FieldItemMetaSchema.parse({ type: isDevMode() ? 'text' : 'text' });
		case 'note': return NoteItemMetaSchema.parse({ fontSize: 13 })
		default: return {}
	}
}
