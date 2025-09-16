import { choices, fieldMappings, vwFormSubmissions } from '@civilio/schema';
import { createPaginatedResultSchema, FieldMappingSchema, FormSubmissionSchema, FormType, Option, OptionSchema } from '@civilio/shared';
import { and, countDistinct, eq, like, or, sql } from 'drizzle-orm';
import { provideDatabase } from '../helpers/db';

export async function findFormOptions(form: FormType) {
  const db = provideDatabase({ choices });
  return await db.select({
    label: choices.label,
    value: choices.name,
    parent: choices.parent,
    i18nKey: choices.i18NKey,
    group: choices.group
  }).from(choices)
    .where(eq(choices.version, form))
    .then(v => {
      const map: Record<string, Option[]> = {};
      v.forEach(x => {
        const entry = map[x.group] ?? [];
        entry.push(OptionSchema.parse(x));
      });
      return map;
    });
}

export async function findFieldMappings(type: FormType) {
  const db = provideDatabase({ fieldMappings });
  return await db.select().from(fieldMappings)
    .where(eq(fieldMappings.form, type))
    .then(v => FieldMappingSchema.array().parse(v));
}

export async function findFormSubmissions(form: FormType, page: number = 0, size: number = 100, filterQuery?: string) {
  const db = provideDatabase({ vwFormSubmissions });
  const filter = filterQuery ? and(eq(vwFormSubmissions.form, form), or(
    like(sql`LOWER(${vwFormSubmissions.index}::TEXT)`, filterQuery.toLowerCase()),
    like(sql`LOWER(${vwFormSubmissions.validationCode})`, filterQuery.toLowerCase()),
    like(sql`LOWER(${vwFormSubmissions.facilityName})`, filterQuery.toLowerCase())
  )) : eq(vwFormSubmissions.form, form);

  const submissions = await db.select().from(vwFormSubmissions)
    .where(filter)
    .limit(size)
    .offset(page * size);
  const [{ totalRecords }] = await db.select({ totalRecords: countDistinct(vwFormSubmissions.index) }).from(vwFormSubmissions)
    .where(filter);

  const schema = createPaginatedResultSchema(FormSubmissionSchema);
  return schema.parse({ totalRecords, data: submissions });
}
