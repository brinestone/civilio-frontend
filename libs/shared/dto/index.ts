import z from "zod";
import { FormTypeSchema } from "../schema";

export const UpdateConfigRequestSchema = z.object({
  path: z.string(),
  value: z.unknown().nullable()
});
export const UpdateFieldMappingRequestSchema = z.object({
  form: FormTypeSchema,
  field: z.string(),
  i18nKey: z.string(),
  dbColumn: z.string().nullable()
})
export const FindFieldMappingsRequestSchema = z.object({
  form: FormTypeSchema
});
export const FindFormSubmissionsRequestSchema = z.object({
  form: FormTypeSchema,
  page: z.number(),
  size: z.number(),
  filter: z.string().optional()
});

export type FindFieldMappingsRequest = z.infer<typeof FindFieldMappingsRequestSchema>;
export type NewFieldMappingRequest = z.infer<typeof UpdateFieldMappingRequestSchema>;
export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;
