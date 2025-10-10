import { choices, fieldMappings, fosaIdSeqInCivilio, fosaIndexSeqInCivilio, fosaPersonnelIndexSeqInCivilio, vwDbColumns, vwFormSubmissions } from '@civilio/schema';
import { createPaginatedResultSchema, FieldMappingSchema, FieldUpdateSpec, FindIndexSuggestionsRequest, FindIndexSuggestionsResponseSchema, FindSubmissionDataResponseSchema, FindSubmissionRefRequest, FormSubmissionSchema, FormType, GetAutoCompletionSuggestionsRequest, GetAutoCompletionSuggestionsResponseSchema, Option, OptionSchema, FormSubmissionUpdateRequest } from '@civilio/shared';
import { and, countDistinct, eq, ExtractTablesWithRelations, like, or, sql } from 'drizzle-orm';
import { PgSequence, PgTransaction } from 'drizzle-orm/pg-core';
import { provideDatabase } from '../helpers/db';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';

const sequences: Record<string, PgSequence | undefined> = {
	'fosa.data_index': fosaIndexSeqInCivilio,
	'fosa.data_personnel_index': fosaPersonnelIndexSeqInCivilio,
	'fosa.data_id': fosaIdSeqInCivilio
};

async function assertRow(index: number, table: string, form: string) {
	const db = provideDatabase({});
	const q = sql`SELECT EXISTS (SELECT _index FROM ${sql.identifier(form)}.${sql.identifier(table)} WHERE _index = ${index}) as row_exists FROM ${sql.identifier(form)}.${sql.identifier(table)};`;
	let result = await db.execute(q);
	const [{ row_exists }] = result.rows;

	const exists = Boolean(row_exists ?? false);

	if (exists) return index;
	const indexKey = `${form}.${table}_index`;
	const idKey = `${form}.${table}_id`
	const indexSeq = sequences[indexKey];
	const idSeq = sequences[idKey];

	if (!indexSeq) throw new Error('Could not find sequences')
	result = await db.execute(sql`INSERT INTO ${sql.identifier(form)}.${sql.identifier(table)}(_index, _id) VALUES (nextval(${indexSeq}), nextval(${idSeq})) RETURNING _index;`)

	const [{ _index }] = result.rows;
	return Number(_index);
}

async function deleteSubmission(tx: PgTransaction<NodePgQueryResultHKT, Record<string, unknown>, ExtractTablesWithRelations<Record<string, unknown>>>, { form, index }: Extract<FormSubmissionUpdateRequest, { type: 'delete' }>) {

}

async function updateSubmission(tx: PgTransaction<NodePgQueryResultHKT, Record<string, unknown>, ExtractTablesWithRelations<Record<string, unknown>>>, { changes, form, index }: Extract<FormSubmissionUpdateRequest, { type: 'update' }>) {
	let _index = index;

	for (const [key, value] of Object.entries(changes)) {
		const [mapping] = await tx.select().from(fieldMappings)
			.where(and(
				eq(fieldMappings.form, form),
				eq(fieldMappings.field, key)
			));

		if (!mapping) throw new Error(`Mapping for key: ${key} not found. Update aborted`);
		_index = await assertRow(_index, mapping.dbTable, form);

		await tx.execute(sql.raw(
			`UPDATE "${form}"."${mapping.dbTable}" SET "${mapping.dbColumn}" = CAST('${value}' as ${mapping.dbColumnType});`,
		));
	}
}

export async function processChangeRequest(arg: FormSubmissionUpdateRequest) {
	const db = provideDatabase({ fieldMappings });
	await db.transaction(async tx => {
		if (arg.type == 'delete') await deleteSubmission(tx, arg);
		else if (arg.type == 'update')
			await updateSubmission(tx, arg);
	});
}

export async function findIndexSuggestions({ form, query }: FindIndexSuggestionsRequest) {
	const db = provideDatabase({ vwFormSubmissions });
	const result = await db.select({
		index: vwFormSubmissions.index
	}).from(vwFormSubmissions)
		.where(and(
			eq(vwFormSubmissions.form, form),
			like(sql<string>`${vwFormSubmissions.index}::TEXT`, `%${query}%`)
		))
		.orderBy(vwFormSubmissions.index)
		.limit(5);

	return FindIndexSuggestionsResponseSchema.parse(result.map(({ index }) => index));
}

export async function findSubmissionRef({ form, index }: FindSubmissionRefRequest) {
	const db = provideDatabase({ vwFormSubmissions });
	const [result] = await db.select({
		next: vwFormSubmissions.next,
		prev: vwFormSubmissions.prev
	}).from(vwFormSubmissions)
		.where(and(
			eq(vwFormSubmissions.index, index),
			eq(vwFormSubmissions.form, form),
		));

	return [result?.prev ?? null, result?.next ?? null]
}

export async function findAutocompleteSuggestions({ form, query, resultSize, field }: GetAutoCompletionSuggestionsRequest) {
	const db = provideDatabase({ fieldMappings });
	const [mapping] = await db.select().from(fieldMappings).where(and(
		eq(fieldMappings.form, form),
		eq(fieldMappings.field, field),
	)).limit(1);

	if (!mapping) throw new Error(`Mapping not found for field: ${field} and form: ${form}`);

	let resultSet = await db.execute(sql`SELECT FORMAT('SELECT UPPER(d.%I::TEXT) AS result FROM %I.%I d WHERE LOWER(d.%I) LIKE LOWER(%L) ORDER BY UPPER(d.%I::TEXT) ASC LIMIT %L::INTEGER', ${mapping.dbColumn}::TEXT, ${form}::TEXT, ${mapping.dbTable}::TEXT, ${mapping.dbColumn}::TEXT, ${'%' + query + '%'}::TEXT, ${mapping.dbColumn}::TEXT, ${resultSize}::INTEGER);`)
	const [{ format }] = resultSet.rows;

	resultSet = await db.execute(format as string);
	const result = resultSet.rows.map(({ result }) => result);

	return GetAutoCompletionSuggestionsResponseSchema.parse(result);
}

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
