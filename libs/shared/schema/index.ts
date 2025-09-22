import { z } from 'zod';

export const ThemeSchema = z.enum(['light', 'system', 'dark']);
export const LocaleSchema = z.enum(['en-CM', 'fr-CM']);
export const FormTypeSchema = z.enum(['csc', 'fosa', 'chefferie']);
export const DbColumnSpecSchema = z.object({
  name: z.string(),
  dataType: z.string(),
  tableName: z.string()
});
export const OptionSchema = z.object({
  label: z.string().nullable(),
  value: z.string().nullable(),
  parent: z.string().nullable(),
  i18nKey: z.string().nullable()
});

export function createPaginatedResultSchema<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    data: schema.array().default([]),
    totalRecords: z.number().default(0)
  })
}

export const FieldMappingSchema = z.object({
  field: z.string(),
  i18nKey: z.string().optional().nullable(),
  dbColumn: z.string(),
  dbTable: z.string(),
  form: FormTypeSchema,
  dbColumnType: z.string()
});

export const validationStatuses = z.enum(['validation_status_approved', 'validation_status_on_hold']);
export const FormSubmissionSchema = z.object({
  id: z.number(),
  index: z.number(),
  validationStatus: validationStatuses.optional().nullable(),
  validationCode: z.string(),
  facilityName: z.string().nullable(),
  submissionTime: z.coerce.date(),
  form: FormTypeSchema,
  isValid: z.boolean()
});
export const AppPrefsSchema = z.object({
  theme: ThemeSchema,
  locale: LocaleSchema
});
export const DbConfigSchema = z.object({
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().default(false),
  host: z.string(),
  port: z.number().default(5432),
  database: z.string()
});
export const AppConfigSchema = z.object({
  db: DbConfigSchema.partial().optional(),
  prefs: AppPrefsSchema.partial().optional()
}).default({});

export type AppPrefs = z.infer<typeof AppPrefsSchema>;
export type FieldMapping = z.infer<typeof FieldMappingSchema>;
export type FormType = z.infer<typeof FormTypeSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type FormSubmission = z.infer<typeof FormSubmissionSchema>;
export type Option = z.infer<typeof OptionSchema>;
export type ThemeMode = z.infer<typeof ThemeSchema>;
export type Locale = z.infer<typeof LocaleSchema>;
export type DbConfig = z.infer<typeof DbConfigSchema>;
export type DbColumnSpec = z.infer<typeof DbColumnSpecSchema>;
type FixArr<T> = T extends readonly any[] ? Omit<T, Exclude<keyof any[], number>> : T;
type DropInitDot<T> = T extends `.${infer U}` ? U : T;
type _DeepKeys<T> = T extends object ? (
  { [K in (string | number) & keyof T]:
    `${(
      `.${K}` | (`${K}` extends `${number}` ? `[${K}]` : never)
    )}${"" | _DeepKeys<FixArr<T[K]>>}` }[
  (string | number) & keyof T]
) : never;
type DeepKeys<T> = DropInitDot<_DeepKeys<FixArr<T>>>;
export type AppConfigPaths = DeepKeys<AppConfig>;
