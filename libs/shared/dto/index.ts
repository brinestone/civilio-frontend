import z from "zod";
import { DbColumnSpecSchema, FormTypeSchema, LocaleSchema, OptionSchema } from "../schema";
import { AllFieldKeysSchema } from "../field-keys";

export const LoadTranslationRequestSchema = z.object({
  locale: LocaleSchema.transform(v => v.split('-')[0].toLowerCase())
});

const strictTranslationBaseSchema = z.union([
  z.string(),
  z.string().array(),
  z.undefined(),
  z.null()
]);
const TranslationObjectSchema: z.ZodSchema = z.lazy(() => {
  return z.record(z.string(), z.union([
    strictTranslationBaseSchema,
    TranslationObjectSchema
  ]))
});
const StrictTranslationSchema = z.union([strictTranslationBaseSchema, TranslationObjectSchema])
const TranslationSchema = z.union([
  StrictTranslationSchema,
  z.any()
]);

export const LoadTranslationResponseSchema = TranslationSchema;
export const TestDbConnectionResponseSchema = z.union([z.literal(true), z.string()]);

export const TestDbConnectionRequestSchema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().optional().default(false)
});
export const UpdateConfigRequestSchema = z.object({
  path: z.string(),
  value: z.unknown().nullable()
});
export const FieldMappingRequestSchema = z.object({
  form: FormTypeSchema,
  field: AllFieldKeysSchema,
  i18nKey: z.string(),
  dbColumn: z.string().nullable()
});
export const FieldUpdateSpecSchema = FieldMappingRequestSchema.pick({
  field: true,
  dbColumn: true
}).extend({
  table: z.string()
}).required();
export const UpdateFieldMappingRequestSchema = z.object({
  updates: FieldUpdateSpecSchema.array(),
  form: FormTypeSchema
});

export const FindFieldMappingsRequestSchema = z.object({
  form: FormTypeSchema
});
export const FindDbColumnsRequestSchema = FindFieldMappingsRequestSchema;
export const FindDbColumnsResponseSchema = DbColumnSpecSchema.array();
export const FindFormOptionsRequestSchema = FindFieldMappingsRequestSchema;
export const FindFormOptionsResponseSchema = z.record(z.string(), OptionSchema.array());
export const FindFormSubmissionsRequestSchema = z.object({
  form: FormTypeSchema,
  page: z.number(),
  size: z.number(),
  filter: z.string().optional()
});

export type FindFieldMappingsRequest = z.infer<typeof FindFieldMappingsRequestSchema>;
export type FieldMappingRequest = z.infer<typeof FieldMappingRequestSchema>;
export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;
export type FindFormOptionsResponse = z.infer<typeof FindFormOptionsResponseSchema>;
export type TestDbConnectionRequest = z.infer<typeof TestDbConnectionRequestSchema>;
export type TestDbConnectionResponse = z.infer<typeof TestDbConnectionResponseSchema>;
export type LoadTranslationRequest = z.input<typeof LoadTranslationRequestSchema>;
export type LoadTranslationResponse = z.output<typeof LoadTranslationResponseSchema>;
export type FindDbColumnsResponse = z.infer<typeof FindDbColumnsResponseSchema>;
export type UpdateFieldMappingRequest = z.infer<typeof UpdateFieldMappingRequestSchema>;
export type FieldUpdateSpec = z.output<typeof FieldUpdateSpecSchema>;
