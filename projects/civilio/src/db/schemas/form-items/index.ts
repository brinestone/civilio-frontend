import z from 'zod';
import { QuestionItem } from './question';

export * from './question';

export const FormItem = z.discriminatedUnion('type', [QuestionItem]);
export type FormItem = z.infer<typeof FormItem>;
export type FormItemType = FormItem['type'];
export type FormItemInput = z.input<typeof FormItem>;
