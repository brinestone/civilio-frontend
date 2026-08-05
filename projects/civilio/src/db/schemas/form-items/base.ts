import { RelevanceDefinition, Tag } from "@civilio/sdk/models";
import { Base } from "../base";
import z from "zod";

export const BaseFormItem = Base.extend({
	id: z.uuid(),
	formVersion: z.uuid(),
	path: z.string(),
	relevance: RelevanceDefinition,
	tags: Tag.array().default([]),
	metaTag: z.string().trim().nullish().default(null),
	parentId: z.string().trim().optional()
});

export const DataKeyItemParams = z.object({
	dataKey: z.string().trim().default(''),
	autoDataKey: z.boolean().default(true)
});


