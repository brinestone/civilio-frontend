import { choices, fieldMappings, vwDbColumns, vwFormSubmissions } from '@civilio/schema';
import { createPaginatedResultSchema, FieldMappingSchema, FieldUpdateSpec, FindSubmissionDataResponseSchema, FormSubmissionSchema, FormType, Option, OptionSchema } from '@civilio/shared';
import { and, countDistinct, eq, like, or, sql } from 'drizzle-orm';
import { provideDatabase } from '../helpers/db';

export async function findFormData(form: FormType, index: number) {
  const db = provideDatabase({ fieldMappings });
  const mappings = await db.select({
    col: fieldMappings.dbColumn,
    table: fieldMappings.dbTable,
    field: fieldMappings.field
  })
    .from(fieldMappings)
    .where(
      eq(fieldMappings.form, form),
    );

  const map: any = {};
  for (const { col, table, field } of mappings) {
    let queryResult = await db.execute(sql`
        SELECT FORMAT('SELECT d.%I::TEXT as query FROM %I.%I d WHERE d.%I = %s::INTEGER;', ${col}::TEXT, ${form}::TEXT, ${table}::TEXT, ${table == 'data' ? '_index' : '_parent_index'}::TEXT, ${index}::INTEGER);
      `);

    const [{ format: query }] = queryResult.rows;

    queryResult = await db.execute(query as string);
    const rows = queryResult.rows;
    if (table != 'data')
      map[field] = [
        ...(map[field] ?? []),
        ...Array.isArray(queryResult.rows)
          ? queryResult.rows.map((row: any) => row.query)
          : []
      ];
    else
      map[field] = rows[0].query;
  }
  return FindSubmissionDataResponseSchema.parse(map);
}

export async function updateFieldMappings(form: FormType, specs: FieldUpdateSpec[]) {
  const db = provideDatabase({ vwDbColumns, fieldMappings });
  return await db.transaction(async tx => {
    for (const spec of specs) {
      const [dbSpec] = await tx.select().from(vwDbColumns).where(
        and(
          eq(vwDbColumns.form, form),
          eq(vwDbColumns.name, spec.dbColumn),
          eq(vwDbColumns.tableName, spec.table)
        )
      );
      if (!dbSpec) {
        throw new Error('Database column datatype could not be determined for column: ' + spec.dbColumn);
      }
      return await tx.insert(fieldMappings)
        .values({
          dbColumn: spec.dbColumn,
          dbColumnType: dbSpec.dataType,
          dbTable: spec.table,
          field: spec.field,
          form,
          i18nKey: spec.field
        }).onConflictDoUpdate({
          target: [fieldMappings.field, fieldMappings.form],
          set: {
            dbColumnType: dbSpec.dataType,
            dbColumn: dbSpec.name,
            dbTable: dbSpec.tableName,
            i18nKey: spec.field
          }
        }).returning();
    }
  })
}

export async function findDbColumns(form: FormType) {
  const db = provideDatabase({ vwDbColumns });
  return await db.select({
    name: vwDbColumns.name,
    dataType: vwDbColumns.dataType,
    tableName: vwDbColumns.tableName,
  }).from(vwDbColumns)
    .where(eq(vwDbColumns.form, form));
}

export async function findFormOptions(form: FormType) {
  const db = provideDatabase({ choices });
  const result = await db.select({
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
        map[x.group] = entry;
      });
      return map;
    });
  return result;
}

export async function findFieldMappings(type: FormType) {
  const db = provideDatabase({ fieldMappings });
  return await db.select().from(fieldMappings)
    .where(eq(fieldMappings.form, type))
    .then(v => FieldMappingSchema.array().parse(v));
}

export async function findFormSubmissions(form: FormType, page: number = 0, size: number = 100, filterQuery?: string) {
  const db = provideDatabase({ vwFormSubmissions });
  const q = `%${filterQuery.toLowerCase()}%`;
  const filter = filterQuery ? and(eq(vwFormSubmissions.form, form), or(
    like(sql`LOWER(${vwFormSubmissions.index}::TEXT)`, q),
    like(sql`LOWER(${vwFormSubmissions.validationCode})`, q),
    like(sql`LOWER(${vwFormSubmissions.facilityName})`, q)
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
