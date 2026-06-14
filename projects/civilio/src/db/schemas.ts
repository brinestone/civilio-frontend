import { Tag } from "@civilio/sdk/models";
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

export const FormItemType = z.enum(['question', 'group']);
export type FormItemType = z.infer<typeof FormItemType>;
const BaseFormItemSchema = BaseSchema.extend({
	id: z.uuid(),
	formVersion: z.uuid(),
	type: FormItemType,
	path: z.string(),
	relevance: z.uuid().nullish().default(null),
	tags: Tag.array().default([]),
	metaTag: z.string().nullish().default(null),
});

const DataKeyItemParams = z.object({
	dataKey: z.string().default(''),
	autoDataKey: z.boolean().default(true)
});

export const BaseQuestionConfig = z.object({
	required: z.boolean().default(false),
	disabled: z.boolean().default(false),
	title: z.string().default(''),
	description: z.string().nullish().default(null),
}).and(DataKeyItemParams);
export type BaseQuestionConfig = z.infer<typeof BaseQuestionConfig>;

export const TextQuestionConfig = z.object({
	placeholder: z.string().nullish().default(null),
	minLength: z.number().nullish().default(null),
	maxLength: z.number().nullish().default(null),
	type: z.union([z.literal('text'), z.literal('multiline')]),
	pattern: z.string().nullish().default(null),
}).and(BaseQuestionConfig);
export type TextQuestionConfig = z.infer<typeof TextQuestionConfig>;

const BaseQuestionFormItem = BaseFormItemSchema.extend({
	type: z.literal('question'),
});

export const TextQuestionItem = BaseQuestionFormItem.extend({
	config: TextQuestionConfig
});
export type TextQuestionItem = z.infer<typeof TextQuestionItem>;

export const FormItem = z.discriminatedUnion('type', [TextQuestionItem])
export type FormItem = z.infer<typeof FormItem>;
