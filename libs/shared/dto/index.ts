import z from "zod";
import { FormTypeSchema } from "../schema";

export const UpdateFieldMappingRequestSchema = z.object({
  form: FormTypeSchema,
  field: z.string(),
  i18nKey: z.string(),
  dbColumn: z.string().nullable()
})
export const FindFieldMappingsRequestSchema = z.object({
  form: FormTypeSchema
});

export type FindFieldMappingsRequest = z.infer<typeof FindFieldMappingsRequestSchema>;
export type NewFieldMappingRequest = z.infer<typeof UpdateFieldMappingRequestSchema>;
