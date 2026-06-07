import { RelevanceDefinition, Tag } from "@civilio/sdk/models";
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

export const FormItemType = z.enum(['question', 'group']);
export type FormItemType = z.infer<typeof FormItemType>;
const BaseFormItemSchema = BaseSchema.extend({
	id: z.uuid(),
	formVersion: z.uuid(),
	type: FormItemType,
	path: z.string(),
	relevance: RelevanceDefinition,
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
