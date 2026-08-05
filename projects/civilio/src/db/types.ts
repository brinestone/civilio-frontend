import { WithVirtualProps } from "@tanstack/db";
import { FormItem, QuestionItem, SectionItem } from "./schemas";

export type FormItemEntity = WithVirtualProps<FormItem>;
export type QuestionItemEntity = WithVirtualProps<QuestionItem>;
export type SectionItemEntity = WithVirtualProps<SectionItem>;
