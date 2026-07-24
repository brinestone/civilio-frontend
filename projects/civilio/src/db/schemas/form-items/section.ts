import z from "zod";
import { BaseQuestionConfig } from "./question";
import { BaseFormItem } from "./base";

export const LayoutAlignment = z.enum(['start', 'center', 'end']);
export const LayoutDirection = z.enum(['horizontal', 'vertical']);
export const LayoutItemParams = z.object({
	orientation: LayoutDirection.nullish().default('vertical'),
	resizable: z.boolean().nullish().default(false),
	itemSpacing: z.number().positive().nullish().default(10),
	itemAlignment: LayoutAlignment.nullish().default('start'),
})

export const SectionConfig = BaseQuestionConfig.and(LayoutItemParams);
export type SectionConfig = z.infer<typeof SectionConfig>;

export const SectionItem = BaseFormItem.omit({
	parentId: true
}).extend({
	type: z.literal('section'),
	config: SectionConfig,
});
export type SectionItem = z.infer<typeof SectionItem>;
