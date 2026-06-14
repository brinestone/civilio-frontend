import { GeoPoint, NumberFieldConfig, NumberRange, Tag } from "@civilio/sdk/models";
import z from "zod";

export const BaseSchema = z.object({
	createdAt: z.string().nullish().default(new Date().toISOString()),
	updatedAt: z.string().nullish().default(new Date().toISOString()),
});
export const Archivable = z.object({
	archivedAt: z.string().nullish().default(null)
})

export const FormVersionSchema = BaseSchema.extend({
	id: z.uuid(),
	form: z.string(),
	parentId: z.uuid().nullish().default(null),
	isCurrent: z.boolean().default(true),
}).and(Archivable);

export const FormSchema = BaseSchema.extend({
	slug: z.string(),
	description: z.string().nullish().default(null),
	title: z.string(),
	archivedAt: z.string().nullish().default(null),
}).and(Archivable);

export const RelevanceDefinition = z.object({
	"id": z.uuid(),
	"enabled": z.boolean().default(true),
	"operator": z.enum(['and', 'or']).default('and'),
	"logic": z.object({
		"operator": z.enum(['and', 'or']),
		"expressions": z.object({
			"question": z.string().nullish().default(null),
			"operator": z.enum(['in', 'eq', 'ne', 'gt', 'lt', 'lte', 'gte', 'empty', 'notEmpty', 'between', 'match', 'isNull', 'isNotNull', 'checked', 'unchecked', 'selectedAny', 'selectedAll', 'startsWith', 'endsWith', 'noselection', 'before', 'after', 'afterOrOn', 'beforeOrOn']).nullish().default(null),
			"negated": z.boolean().default(false),
			"value": z.union([
				z.union([
					z.string(),
					z.number(),
					z.boolean()
				]),
				z.union([
					z.string(),
					z.number(),
					z.boolean()
				]).array(),
				z.object({
					"start": z.number().nullish(),
					"end": z.number().nullish()
				})])
				.nullish()
				.default(null)
		}).array().default([])
	}).array().default([])
});
export type RelevanceDefinition = z.infer<typeof RelevanceDefinition>;

export const FormItemType = z.enum(['question']);
export type FormItemType = z.infer<typeof FormItemType>;
const BaseFormItemSchema = BaseSchema.extend({
	id: z.uuid(),
	formVersion: z.uuid(),
	type: FormItemType,
	path: z.string(),
	relevance: z.uuid().nullish().default(null),
	tags: Tag.array().default([]),
	metaTag: z.string().nullish().default(null),
	parentId: z.string().optional()
});

const DataKeyItemParams = z.object({
	dataKey: z.string().default(''),
	autoDataKey: z.boolean().default(true)
});

const BaseQuestionConfig = DataKeyItemParams.extend({
	required: z.boolean().default(false),
	disabled: z.boolean().default(false),
	disabledReason: z.string().nullish().default(null),
	title: z.string().default(''),
	description: z.string().nullish().default(null),
	readonly: z.boolean().default(false)
});

export const GeoPointQuestionConfig = BaseQuestionConfig.extend({
	defaultValue: GeoPoint.nullish().default(null),
	type: z.literal('geo-point')
});
export type GeoPointQuestionConfig = z.infer<typeof GeoPointQuestionConfig>;

export const TextQuestionConfig = BaseQuestionConfig.extend({
	placeholder: z.string().nullish().default(null),
	minLength: z.number().nullish().default(null),
	maxLength: z.number().nullish().default(null),
	type: z.union([z.literal('text'), z.literal('multiline')]),
	pattern: z.string().nullish().default(null),
	defaultValue: z.string().nullish().default(null)
});
export type TextQuestionConfig = z.infer<typeof TextQuestionConfig>;

export const BooleanQuestionConfig = BaseQuestionConfig.extend({
	defaultValue: z.boolean().default(false),
	renderAs: z.enum(['checkbox', 'select']).default('checkbox'),
	type: z.literal('boolean')
});
export type BooleanQuestionConfig = z.infer<typeof BooleanQuestionConfig>;

export const MultiDateQuestionConfig = BaseQuestionConfig.extend({
	defaultValue: z.number().array().nullish().default([]),
	minSelection: z.number().nullish().default(null),
	maxSelection: z.number().nullish().default(null),
	min: z.number().nullish().default(null),
	max: z.number().nullish().default(null),
	type: z.literal('multi-date')
});
export type MultiDateQuestionConfig = z.infer<typeof MultiDateQuestionConfig>;

export const MultiSelectQuestionConfig = BaseQuestionConfig.extend({
	defaultValue: z.string().array().default([]),
	itemSourceRef: z.string().nullish().default(null),
	hardItems: z.object({
		label: z.string().default(''),
		value: z.string().nullish().default(null)
	}).array().default([]),
	type: z.literal('multi-select')
});
export type MultiSelectQuestionConfig = z.infer<typeof MultiSelectQuestionConfig>;

export const NumberQuestionConfig = BaseQuestionConfig.extend({
	defaultValue: z.number().nullish().default(null),
	type: z.union([z.literal('integer'), z.literal('float')]),
	min: z.number().nullish().default(null),
	max: z.number().nullish().default(null),
});
export type NumberQuestionConfig = z.infer<typeof NumberQuestionConfig>;

export const RangeDateQuestionConfig = BaseQuestionConfig.extend({
	min: z.number().nullish().default(null),
	max: z.number().nullish().default(null),
	type: z.literal('date-range'),
	defaultValue: NumberRange.default({ end: null, start: null })
})
export type RangeDateQuestionConfig = z.infer<typeof RangeDateQuestionConfig>;

export const SelectQuestionConfig = MultiSelectQuestionConfig.extend({
	defaultValue: z.string().nullish().default(null),
	type: z.literal('single-select')
});
export type SelectQuestionConfig = z.infer<typeof SelectQuestionConfig>;

export const SimpleDateQuestionConfig = BaseQuestionConfig.extend({
	defaultValue: z.number().nullish().default(null),
	min: z.number().nullish().default(null),
	max: z.number().nullish().default(null),
	type: z.union([z.literal('date'), z.literal('date-time')])
});
export type SimpleDateQuestionConfig = z.infer<typeof SimpleDateQuestionConfig>;

export const QuestionConfig = z.discriminatedUnion('type', [SimpleDateQuestionConfig, SelectQuestionConfig, RangeDateQuestionConfig, NumberQuestionConfig, MultiSelectQuestionConfig, TextQuestionConfig, BooleanQuestionConfig, GeoPointQuestionConfig, MultiDateQuestionConfig]);
export type QuestionConfig = z.infer<typeof QuestionConfig>;
const BaseQuestionFormItem = BaseFormItemSchema.extend({
	type: z.literal('question'),
});

export const TextQuestionItem = BaseQuestionFormItem.extend({
	config: TextQuestionConfig.optional()
});
export type TextQuestionItem = z.infer<typeof TextQuestionItem>;

export const FormItem = z.discriminatedUnion('type', [TextQuestionItem])
export type FormItem = z.infer<typeof FormItem>;
