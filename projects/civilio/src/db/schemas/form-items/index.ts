import z from 'zod';
import { QuestionItem } from './question';
import { SectionItem } from './section';

export * from './question';

export const FormItem = z.discriminatedUnion('type', [QuestionItem, SectionItem]);
export type FormItem = z.infer<typeof FormItem>;
export type FormItemType = FormItem['type'];
export type FormItemInput = z.input<typeof FormItem>;
