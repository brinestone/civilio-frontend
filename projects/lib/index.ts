import { z } from 'zod';
export const FormTypeSchema = z.enum(['csc', 'fosa', 'chefferie']);
export const FieldMappingSchema = z.object({
  field: z.string(),
  i18nKey: z.string().optional().nullable(),
  dbColumn: z.string(),
  dbTable: z.string(),
  type: FormTypeSchema
});
