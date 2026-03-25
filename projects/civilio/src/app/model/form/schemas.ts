import { isDevMode } from "@angular/core";
import {
	FormItemDefinition,
	FormItemGroup,
	NewFormItemDefinition,
	NewFormItemGroup,
	RelevanceLogicExpression, RelevanceLogicExpressionOperator
} from "@civilio/sdk/models";
import {
	FieldKeySchema,
	FormTypeSchema,
	GeoPointSchema,
	OptionSchema
} from "@civilio/shared";
import z from "zod";

export const operatorsMap = {
	in: { label: 'Contains', operandCount: 1 },
	eq: { label: 'Equals', operandCount: 1 },
	ne: { label: 'Not equal to', operandCount: 1 },
	gt: { label: 'Greater than', operandCount: 1 },
	lt: { label: 'Less than', operandCount: 1 },
	lte: { label: 'Less than or equal to', operandCount: 1 },
	gte: { label: 'Greater than or equal to', operandCount: 1 },
	empty: { label: 'Is Empty', operandCount: 0 },
	notEmpty: { label: 'Is not empty', operandCount: 0 },
	between: { label: 'Is between', operandCount: 2 },
	match: { label: 'Matches', operandCount: 1 },
	isNull: { label: 'Has no value', operandCount: 0 },
	isNotNull: { label: 'Has a value', operandCount: 0 },
	checked: { label: 'Is Checked', operandCount: 0 },
	unchecked: { label: 'Is Unchecked', operandCount: 0 },
	selectedAny: { label: 'Contains any of', operandCount: 1 },
	selectedAll: { label: 'Contains all of', operandCount: 1 },
	noselection: { label: 'Has no selection', operandCount: 0 },
	endsWith: { label: 'Ends with', operandCount: 1 },
	startsWith: { label: 'Starts with', operandCount: 1 },
	before: { label: 'Is before', operandCount: 1 },
	after: { label: 'Is after', operandCount: 1 },
	afterOrOn: { label: 'Is after or on', operandCount: 1 },
	beforeOrOn: { label: 'Is before or on', operandCount: 1 },
} as Record<RelevanceLogicExpressionOperator, {
	label: string,
	operandCount: number
}>;
export const fieldTypeExpressionOperatorsMap = {
	'boolean': ['checked', 'unchecked'],
	'date-time': ['between', 'before', 'after', 'afterOrOn', 'beforeOrOn', 'isNull'],
	'date': ['between', 'before', 'after', 'afterOrOn', 'beforeOrOn', 'isNull'],
	'multi-date': ['empty', 'in', 'between', 'before', 'after'],
	'date-range': ['isNull', 'before', 'after'],
	'single-select': ['selectedAny', 'selectedAll', 'noselection'],
	'multi-select': ['selectedAny', 'selectedAll', 'noselection'],
	'float': ['between', 'lt', 'gt', 'gte', 'lte', 'eq', 'ne', 'isNull'],
	'integer': ['between', 'lt', 'gt', 'gte', 'lte', 'eq', 'ne', 'isNull'],
	'geo-point': ['isNull', 'isNotNull'],
	'multiline': ['eq', 'ne', 'in', 'empty', 'match', 'notEmpty', 'startsWith', 'endsWith'],
	'text': ['eq', 'ne', 'in', 'empty', 'match', 'notEmpty', 'startsWith', 'endsWith'],
} as Record<string, (keyof typeof operatorsMap)[]>;

export const RelevanceLogicExpressionInputSchema = RelevanceLogicExpression.extend({
	field: RelevanceLogicExpression.shape.field.nullish().default(null),
	operator: RelevanceLogicExpression.shape.operator.nullish().default(null),
	value: RelevanceLogicExpression.shape.value.default(null)
})
export type RelevanceLogicExpressionInput = z.input<typeof RelevanceLogicExpressionInputSchema>;
export const FieldTypeSchema = z.enum(['text', 'multiline', 'single-select', 'multi-select', 'boolean', 'float', 'integer', 'date', 'date-time', 'date-range', 'multi-date', 'geo-point']);
export const DateFieldTypesSchema = FieldTypeSchema.extract(['date', 'multi-date', 'date-range', 'date-time']);
export const BaseFieldItemConfigSchema = z.object({
	required: z.boolean().nullish().default(true),
	dataKey: z.string().trim().nullish().default(null),
	title: z.string().nullish().default(null),
	description: z.string().nullish().default(null),
	defaultValue: z.any().nullish().default(null),
	readonly: z.boolean().nullish().default(false),
});

export const GeoPointFieldItemConfigSchema = BaseFieldItemConfigSchema.extend({
	type: FieldTypeSchema.extract(['geo-point']),
	default: z.object({
		lat: z.coerce.number(),
		long: z.coerce.number()
	}).nullish().default(null)
});
export const BaseDateFieldItemConfigSchema = BaseFieldItemConfigSchema.extend({
	min: z.coerce.number().nullish().default(null),
	max: z.coerce.number().nullish().default(null),
});
export const SimpleDateFieldItemConfigSchema = BaseDateFieldItemConfigSchema.extend({
	type: FieldTypeSchema.extract(['date', 'date-time']),
	defaultValue: z.coerce.number().nullish().default(null)
});
export const DateRangeSchema = z.object({
	start: z.int().nullish().default(null),
	end: z.int().nullish().default(null)
});
export const RangeDateFieldItemConfigSchema = BaseDateFieldItemConfigSchema.extend({
	type: FieldTypeSchema.extract(['date-range']),
	defaultValue: DateRangeSchema.nullish().default(null)
});
export const MultiDateFieldItemConfigSchema = BaseDateFieldItemConfigSchema.extend({
	type: FieldTypeSchema.extract(['multi-date']),
	defaultValue: z.coerce.number().array().nullish().default(null),
	minSelection: z.int().nullish().default(null),
	maxSelection: z.int().nullish().default(null),
})
export const DateFieldItemConfigSchema = z.discriminatedUnion('type', [
	SimpleDateFieldItemConfigSchema,
	RangeDateFieldItemConfigSchema,
	MultiDateFieldItemConfigSchema
])
export const NumberFieldItemConfigSchema = BaseFieldItemConfigSchema.extend({
	min: z.number().nullish().default(null),
	max: z.number().nullish().default(null),
	defaultValue: z.number().nullish().default(null),
	type: FieldTypeSchema.extract(['integer', 'float'])
});
export const BooleanFieldItemConfigSchema = BaseFieldItemConfigSchema.extend({
	type: FieldTypeSchema.extract(['boolean']),
	defaultValue: z.boolean().nullish().default(false),
	renderAs: z.enum(['select', 'checkbox']).nullish().default('checkbox')
});

export const SelectFieldItemConfigSchema = BaseFieldItemConfigSchema.extend({
	type: FieldTypeSchema.extract(['single-select', 'multi-select']),
	itemSourceRef: z.string().nullish().default(isDevMode() ? 'refs:dataset::aecbbee7b14a7b0324721bbcbb4359aaa796858fa92cbe01e32adbad35478f7b' : null),
	defaultValue: z.any().nullish().default(null),
	hardItems: OptionSchema.omit({
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
export const TextFieldItemConfigSchema = BaseFieldItemConfigSchema.extend({
	defaultValue: z.string().nullish().default(null),
	// autocomplete: AutocompleteSourceDefinitionSchema.nullish(),
	pattern: z.string().nullish().default(null),
	minlength: z.number().nullish().default(null),
	maxlength: z.number().nullish().default(null),
	type: FieldTypeSchema.extract(['text', 'multiline']),
});
export const FieldItemConfigSchema = z.discriminatedUnion('type', [
	GeoPointFieldItemConfigSchema,
	DateFieldItemConfigSchema,
	NumberFieldItemConfigSchema,
	BooleanFieldItemConfigSchema,
	TextFieldItemConfigSchema,
	SelectFieldItemConfigSchema
]);
export const ImageItemConfigSchema = z.object({
	aspectRatio: z.coerce.number().nullish().default(100),
	caption: z.string().trim().nullish().default(null),
	height: z.coerce.number().nullish().default(144),
	width: z.coerce.number().nullish().default(142),
	filter: z.enum(['shadow', 'blur', 'none']).nullish().default('none')
})
export const NoteItemConfigSchema = z.object({
	fontSize: z.number().optional().default(13)
});
export const SeparatorItemConfigSchema = z.object({
	orientation: z.enum(['vertical', 'horizontal']).nullish().default('horizontal')
});
export const GroupItemConfigSchema = z.object({
	fields: z.any().array().nullish().default([])
})
export type FieldType = z.infer<typeof FieldTypeSchema>;
export type DateFieldTypes = z.infer<typeof DateFieldTypesSchema>;
export type FieldItemConfig = z.infer<typeof FieldItemConfigSchema>;
export type DatefieldItemConfig = z.infer<typeof DateFieldItemConfigSchema>;
// export type FormItemConfigOf<T = Strict<FormVersionDefinition>['items'][number]['type']> = T extends 'field' ? ConfigWrapper<z.output<typeof FieldItemConfigSchema>> : T extends 'note' ? ConfigWrapper<z.output<typeof NoteItemConfigSchema>> : never;

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
