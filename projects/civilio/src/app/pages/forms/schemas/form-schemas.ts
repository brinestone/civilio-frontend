import { isDevMode, Signal } from "@angular/core";
import { apply, applyEach, applyWhen, applyWhenValue, debounce, disabled, hidden, maxLength, min, minLength, required, SchemaPath, SchemaPathTree, validate } from "@angular/forms/signals";
import { FieldItemMeta, FieldItemMetaSchema, NoteItemMetaSchema, } from "@app/model/form";
import { FormItemDefinition, FormVersionDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";

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
}
function defineDateFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'date-time' | 'date' }>>) {
}
function defineNumberFieldMetaFormSchema(paths: SchemaPathTree<Extract<FieldItemMeta, { type: 'float' | 'integer' }>>) {
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
		const isNumber = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'float' | 'integer' }> => v.type === 'integer' || v.type === 'float';
		const isSelection = (v: FieldItemMeta): v is Extract<FieldItemMeta, { type: 'single-select' | 'multi-select' }> => v.type === 'multi-select' || v.type === 'single-select';


		applyWhenValue(fieldPaths, isText, defineTextFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isGeo, defineGeopointFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isDate, defineDateFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isBoolean, defineBooleanFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isNumber, defineNumberFieldMetaFormSchema);
		applyWhenValue(fieldPaths, isSelection, defineSelectionFieldMetaFormSchema);
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
			dependencies: [],
			additionalData: {}
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
		case 'field': return FieldItemMetaSchema.parse({ type: 'single-select' });
		case 'note': return NoteItemMetaSchema.parse({ fontSize: 13 })
		default: return {}
	}
}
