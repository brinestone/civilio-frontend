import { WithVirtualProps } from "@tanstack/db";
import { FormItem, QuestionItem } from "./schemas";

export type FormItemEntity = WithVirtualProps<FormItem>;
export type QuestionItemEntity = WithVirtualProps<QuestionItem>;
