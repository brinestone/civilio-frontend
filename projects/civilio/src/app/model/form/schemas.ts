import { isDevMode } from "@angular/core";
import { FormItemDefinition, FormItemField, FormItemGroup } from "@civilio/sdk/models";
import {
	FieldKeySchema,
	FormTypeSchema,
	GeoPointSchema,
	OptionSchema
} from "@civilio/shared";
import z from "zod";

const logicOperators = {
	gt: '>',
	gte: '>=',
	lt: '<',
	lte: '<=',
	not: '!',
	truthy: '!!',
	and: 'and',
	or: 'or',
	eq: '==',
	ne: '!=',
} as const;

const mathOperators = {
	add: '+',
	minus: '-',
	mult: '*',
	div: '/',
	mod: '%',
	min: 'min',
	max: 'max'
} as const;

const arrayOperators = {
	in: 'in',
	merge: 'merge',
	len: 'length',
	get: 'get'
} as const;

export function isGroupItem(v: FormItemDefinition): v is FormItemGroup {
	return v?.type === 'group';
}
export function isFieldItem(v: FormItemDefinition): v is FormItemField {
	return v.type === 'field';
}

export const ArrayOperatorsSchema = z.enum(arrayOperators);
export const MathOperatorsSchema = z.enum(mathOperators);
export const LogicOperatorsSchema = z.enum(logicOperators);
export const FieldTypeSchema = z.enum(['text', 'multiline', 'single-select', 'multi-select', 'boolean', 'float', 'integer', 'date', 'date-time', 'date-range', 'multi-date', 'geo-point']);
export const DateFieldTypesSchema = FieldTypeSchema.extract(['date', 'multi-date', 'date-range', 'date-time']);
export const BaseFieldItemMetaSchema = z.object({
	required: z.boolean().nullish().default(true),
	span: z.int().nullish().default(12),
	defaultValue: z.any().nullish().default(null),
	readonly: z.boolean().nullish().default(false),
});

export const GeoPointFieldItemMetaSchema = BaseFieldItemMetaSchema.extend({
	type: FieldTypeSchema.extract(['geo-point']),
	default: z.object({
		lat: z.coerce.number(),
		long: z.coerce.number()
	}).nullish().default(null)
});
export const BaseDateFieldItemMetaSchema = BaseFieldItemMetaSchema.extend({
	min: z.coerce.number().nullish().default(null),
	max: z.coerce.number().nullish().default(null),
});
export const SimpleDateFieldItemMetaSchema = BaseDateFieldItemMetaSchema.extend({
	type: FieldTypeSchema.extract(['date', 'date-time']),
	defaultValue: z.coerce.number().nullish().default(null)
});
export const DateRangeSchema = z.object({
	start: z.int().nullish().default(null),
	end: z.int().nullish().default(null)
});
export const RangeDateFieldItemMetaSchema = BaseDateFieldItemMetaSchema.extend({
	type: FieldTypeSchema.extract(['date-range']),
	defaultValue: DateRangeSchema.nullish().default(null)
});
export const MultiDateFieldItemMetaSchema = BaseDateFieldItemMetaSchema.extend({
	type: FieldTypeSchema.extract(['multi-date']),
	defaultValue: z.coerce.number().array().nullish().default(null),
	minSelection: z.int().nullish().default(null),
	maxSelection: z.int().nullish().default(null),
})
export const DateFieldItemMetaSchema = z.discriminatedUnion('type', [
	SimpleDateFieldItemMetaSchema,
	RangeDateFieldItemMetaSchema,
	MultiDateFieldItemMetaSchema
])
export const NumberFieldItemMetaSchema = BaseFieldItemMetaSchema.extend({
	min: z.number().nullish().default(null),
	max: z.number().nullish().default(null),
	defaultValue: z.number().nullish().default(null),
	type: FieldTypeSchema.extract(['integer', 'float'])
});
export const BooleanFieldItemMetaSchema = BaseFieldItemMetaSchema.extend({
	type: FieldTypeSchema.extract(['boolean']),
	defaultValue: z.boolean().nullish().default(false)
});

export const SelectFieldItemMetaSchema = BaseFieldItemMetaSchema.extend({
	type: FieldTypeSchema.extract(['single-select', 'multi-select']),
	optionSourceRef: z.string().nullish().default(isDevMode() ? 'refs:dataset::aecbbee7b14a7b0324721bbcbb4359aaa796858fa92cbe01e32adbad35478f7b' : null),
	defaultValue: z.any().nullish().default(null),
	hardOptions: OptionSchema.omit({
		parent: true,
		i18nKey: true
	}).extend({
		label: z.string().nullish().default(null),
		value: z.string().nullish().default(null),
	}).array().default([])
});
// export const AutocompleteSourceDefinitionSchema = z.object({
// 	allowNewItems
// })
export const TextFieldItemMetaSchema = BaseFieldItemMetaSchema.extend({
	defaultValue: z.string().nullish().default(null),
	// autocomplete: AutocompleteSourceDefinitionSchema.nullish(),
	pattern: z.string().nullish().default(null),
	minlength: z.number().nullish().default(null),
	maxlength: z.number().nullish().default(null),
	type: FieldTypeSchema.extract(['text', 'multiline']),
});
export const FieldItemMetaSchema = z.discriminatedUnion('type', [
	GeoPointFieldItemMetaSchema,
	DateFieldItemMetaSchema,
	NumberFieldItemMetaSchema,
	BooleanFieldItemMetaSchema,
	TextFieldItemMetaSchema,
	SelectFieldItemMetaSchema
]);
export const ImageItemMetaSchema = z.object({
	aspectRatio: z.coerce.number().nullish().default(100),
	caption: z.string().trim().nullish().default(null),
	height: z.coerce.number().nullish().default(null),
	width: z.coerce.number().nullish().default(null)
})
export const NoteItemMetaSchema = z.object({
	fontSize: z.number().optional().default(13)
});
export const SeparatorItemMetaSchema = z.object({
	orientation: z.enum(['vertical', 'horizontal']).nullish().default('horizontal')
});
export type FieldType = z.infer<typeof FieldTypeSchema>;
export type DateFieldTypes = z.infer<typeof DateFieldTypesSchema>;
export type FieldItemMeta = z.infer<typeof FieldItemMetaSchema>;
export type DatefieldItemMeta = z.infer<typeof DateFieldItemMetaSchema>;
// export type FormItemMetaOf<T = Strict<FormVersionDefinition>['items'][number]['type']> = T extends 'field' ? MetaWrapper<z.output<typeof FieldItemMetaSchema>> : T extends 'note' ? MetaWrapper<z.output<typeof NoteItemMetaSchema>> : never;

const FieldValueBaseSchema = z.union([z.string(), z.number(), z.date(), z.boolean(), OptionSchema]);
const FieldValueSchema = z.union([FieldValueBaseSchema, FieldValueBaseSchema.array()]);
const ParsedValueSchema = z.union([
	z.string(),
	z.boolean(),
	z.null(),
	z.undefined().pipe(z.transform(() => null)),
	GeoPointSchema,
	z.number()
])
export const ValueProviderFnSchema = z.function({
	input: z.tuple([FieldKeySchema], FieldKeySchema),
	output: z.record(FieldKeySchema, z.union([FieldValueSchema, FieldValueSchema.array()]).nullable())
});
export const RelevancePredicateSchema = z.function({
	input: [z.record(FieldKeySchema, z.union([ParsedValueSchema, ParsedValueSchema.array()]))],
	output: z.boolean()
});
export const RelevanceDefinitionSchema = z.object({
	predicate: RelevancePredicateSchema,
	dependencies: FieldKeySchema.array()
});
const ValidateFnSchema = z.function({
	input: [z.union([ParsedValueSchema, ParsedValueSchema.array()])],
	output: z.union([z.null(), z.string()])
});

const BaseFieldDefinitionSchema = z.object({
	key: z.union([FieldKeySchema, z.object({
		value: FieldKeySchema,
		titleArgs: z.record(z.string(), z.unknown())
	})]),
	required: z.literal(true).optional(),
	validate: ValidateFnSchema.optional(),
	relevance: z.object({
		predicate: RelevancePredicateSchema,
		dependencies: FieldKeySchema.array()
	}).optional(),
	span: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(6),
		z.literal(7),
		z.literal(8),
		z.literal(9),
		z.literal(10),
		z.literal(11),
		z.literal(12),
	]).optional().default(12),
	readonly: z.boolean().optional(),
	default: z.any().optional()
});

const TextFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
	type: z.literal('text'),
	pattern: z.string().optional(),
	autocomplete: z.boolean().optional(),
	multiline: z.boolean().optional(),
	validValues: z.string().array().optional()
})

const SelectionFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
	optionsGroupKey: z.string(),
	parent: FieldKeySchema.optional(),
	type: z.union([z.literal('single-selection'), z.literal('multi-selection')])
});

const DateFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
	type: z.literal('date'),
	min: z.union([z.iso.date(), z.number(), z.date()]).optional(),
	max: z.union([z.iso.date(), z.number(), z.date()]).optional(),
	defaultToToday: z.literal(true).optional()
});

const GeoPointFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
	type: z.literal('point'),
})

const BooleanFieldDefinitionSchema = BaseFieldDefinitionSchema.omit({
	required: true
}).extend({
	type: z.literal('boolean'),
});

const NumberFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
	type: z.union([z.literal('float'), z.literal('int')]),
	min: z.number().optional(),
	max: z.number().optional(),
	unit: z.string().optional(),
	precision: z.number().optional()
});

export const BaseColumnDefinition = z.object({
	visible: z.literal(false).optional(),
	key: FieldKeySchema,
	draggable: z.boolean().optional(),
	width: z.int().optional(),
	editable: z.literal(false).optional(),
	default: z.any().optional(),
	relevance: RelevanceDefinitionSchema.optional()
});

export const TextColumnDefinitionSchema = BaseColumnDefinition.extend({
	type: z.literal('text')
})

export const NumberColumnDefinitionSchema = BaseColumnDefinition.extend({
	min: z.number().optional(),
	max: z.number().optional(),
	type: z.literal('number')
})

export const SelectionColumnDefinitionSchema = BaseColumnDefinition.extend({
	optionGroupKey: z.string(),
	type: z.enum(['single-selection', 'multi-selection'])
})

export const BooleanColumnDefinitionSchema = BaseColumnDefinition.extend({
	type: z.literal('boolean')
});

export const DateColumnDefinitionSchema = BaseColumnDefinition.extend({
	type: z.literal('date'),
	min: z.coerce.date().optional(),
	max: z.coerce.date().optional()
});

export const ColumnDefinitionSchema = z.discriminatedUnion('type', [
	DateColumnDefinitionSchema,
	BooleanColumnDefinitionSchema,
	SelectionColumnDefinitionSchema,
	NumberColumnDefinitionSchema,
	TextColumnDefinitionSchema
]);

const TabularFieldDefinitionSchema = BaseFieldDefinitionSchema
	.omit({
		span: true,
		required: true,
		default: true,
	}).extend({
		type: z.literal('table'),
		columns: z.record(z.string(), ColumnDefinitionSchema),
		identifierColumn: FieldKeySchema
	});

const GroupFieldDefinitionSchema = BaseFieldDefinitionSchema.omit({
	span: true,
	required: true,
	default: true,
}).extend({
	type: z.literal('group'),
	identifierKey: z.string(),
	fields: z.discriminatedUnion('type', [
		BooleanFieldDefinitionSchema.extend({
			cssClass: z.string().optional(),
			visible: z.literal(false).optional()
		}),
		DateFieldDefinitionSchema.extend({
			cssClass: z.string().optional(),
			visible: z.literal(false).optional()
		}),
		SelectionFieldDefinitionSchema.extend({
			cssClass: z.string().optional(),
			visible: z.literal(false).optional()
		}),
		TextFieldDefinitionSchema.extend({
			cssClass: z.string().optional(),
			visible: z.literal(false).optional()
		}),
		NumberFieldDefinitionSchema.extend({
			cssClass: z.string().optional(),
			visible: z.literal(false).optional()
		})
	]).array()
});

export const FieldDefinitionSchema = z.discriminatedUnion('type', [
	BooleanFieldDefinitionSchema,
	GeoPointFieldDefinitionSchema,
	DateFieldDefinitionSchema,
	SelectionFieldDefinitionSchema,
	TextFieldDefinitionSchema,
	NumberFieldDefinitionSchema,
	TabularFieldDefinitionSchema,
	GroupFieldDefinitionSchema
])

const GroupBaseSchema = z.object({
	id: z.string(),
	fields: FieldDefinitionSchema.array(),
	relevance: RelevanceDefinitionSchema.optional(),
});
export const FormGroupSchema = GroupBaseSchema.extend({
	children: GroupBaseSchema.array().optional(),
	columns: z.union([
		z.int(),
		z.string().array()
	]).optional()
});

export type GroupDefinition = z.output<typeof FormGroupSchema>;

export const FormModelDefinitionSchema = z.object({
	sections: FormGroupSchema.array(),
	meta: z.object({
		form: FormTypeSchema,
		label: z.string().optional()
	})
});

export type FieldSchema = z.output<typeof FieldDefinitionSchema>;
export type GroupFieldSchema = Extract<FieldSchema, { type: 'group' }>;
export type TabularFieldSchema = Extract<FieldSchema, { type: 'table' }>;
export type FormSchema = z.output<typeof FormModelDefinitionSchema>;
export type SectionSchema = z.output<typeof FormGroupSchema>;
export type ValueProviderFn = z.output<typeof ValueProviderFnSchema>;
export type RelevanceFn = z.output<typeof RelevancePredicateSchema>;
export type RelevanceDefinition = z.output<typeof RelevanceDefinitionSchema>;
export type ColumnDefinition = z.output<typeof ColumnDefinitionSchema>;
export type DefinitionLike = {
	type: FieldSchema['type'] | ColumnDefinition['type'],
	relevance?: RelevanceDefinition,
	default?: any
};
