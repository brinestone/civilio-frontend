import {
	choices,
	cscIdSeqInCivilio,
	cscIndexSeqInCivilio,
	cscPersonnelIndexSeqInCivilio,
	fieldMappings,
	fosaIdSeqInCivilio,
	fosaIndexSeqInCivilio,
	fosaPersonnelIndexSeqInCivilio,
	vwDbColumns,
	vwFormSubmissions,
} from "@civilio/schema";
import {
	createPaginatedResultSchema,
	FieldMapping,
	FieldMappingSchema,
	FieldUpdateSpec,
	FindIndexSuggestionsRequest,
	FindIndexSuggestionsResponseSchema,
	FindSubmissionDataResponseSchema,
	FindSubmissionRefRequest,
	FormSubmissionSchema,
	FormSubmissionUpdateRequest,
	FormType,
	GetAutoCompletionSuggestionsRequest,
	GetAutoCompletionSuggestionsResponseSchema,
	Option,
	OptionSchema,
	RemoveFieldMappingRequest,
	UnwrapArray,
	UpdateSubmissionSubFormDataRequest,
} from "@civilio/shared";
import { and, countDistinct, eq, like, or, sql, } from "drizzle-orm";
import { PgSequence } from "drizzle-orm/pg-core";
import { entries } from "lodash";
import { provideDatabase } from "../helpers/db";
import { Transaction } from '../types';

const sequences: Record<
	string,
	Record<string, { column: string; sequence: PgSequence }[]>
> = {
	fosa: {
		data: [
			{ column: "_index", sequence: fosaIndexSeqInCivilio },
			{ column: "_id", sequence: fosaIdSeqInCivilio },
		],
		data_personnel: [
			{ column: "_index", sequence: fosaPersonnelIndexSeqInCivilio },
		],
	},
	csc: {
		data: [
			{ column: "_index", sequence: cscIndexSeqInCivilio },
			{ column: "_id", sequence: cscIdSeqInCivilio },
			{ column: "data_personnel", sequence: cscPersonnelIndexSeqInCivilio },
		],
	},
};

export async function removeFieldMapping({
	form,
	field,
}: RemoveFieldMappingRequest) {
	const db = provideDatabase({ fieldMappings });
	return await db.transaction(async (tx) => {
		const result = await tx
			.delete(fieldMappings)
			.where(and(eq(fieldMappings.form, form), eq(fieldMappings.field, field)));
		return result.rowCount == 1;
	});
}

async function processSubFormDeletionRequest(
	tx: Transaction,
	{
		form,
		indexes,
		parentIndex,
	}: Extract<UpdateSubmissionSubFormDataRequest, { type: "delete" }>,
) {
	if (indexes.length == 0) return;

	const identifierMappingMap = new Map<string, FieldMapping>();
	for (const { index, identifierKey } of indexes) {
		let mapping = identifierMappingMap.get(identifierKey);
		if (!identifierMappingMap.has(identifierKey)) {
			mapping = await lookupMapping(identifierKey, form, tx);
			identifierMappingMap.set(identifierKey, mapping);
		}

		await tx.execute(
			sql.raw(`
			DELETE FROM
				"${form}"."${mapping.dbTable}"
			WHERE
				"_index" = ${index} AND "_parent_index" = ${parentIndex};
			`),
		);
	}
}

async function lookupMapping(field: string, form: FormType, tx: Transaction) {
	const [result] = await tx
		.select()
		.from(fieldMappings)
		.where(and(eq(fieldMappings.form, form), eq(fieldMappings.field, field)))
		.$withCache();
	return result ?? null;
}

async function processSubFormUpdateRequest(
	tx: Transaction,
	{
		changes,
		form,
		parentIndex,
	}: Extract<UpdateSubmissionSubFormDataRequest, { type: "update" }>,
) {
	for (const {
		identifier: { fieldKey, value: index },
		data,
	} of changes) {
		let _index = await assertRowUsingKey(tx, index, fieldKey, form, [
			"_parent_index",
			parentIndex,
		]);
		for (const [key, value] of entries(data)) {
			const mapping = await lookupMapping(key, form, tx);
			await tx.execute(
				sql.raw(`
				UPDATE "${form}"."${mapping.dbTable}"
				SET "${mapping.dbColumn}" = CAST('${value}' as ${mapping.dbColumnType})
				WHERE _parent_index = ${parentIndex} AND _index = ${_index};
				`),
			);
		}
	}
}

export async function processSubFormChangeRequest(
	arg: UpdateSubmissionSubFormDataRequest,
) {
	const db = provideDatabase({ fieldMappings });
	await db.transaction(async (tx) => {
		if (arg.type == "delete") {
			return await processSubFormDeletionRequest(tx, arg);
		} else if (arg.type == "update") {
			return await processSubFormUpdateRequest(tx, arg);
		}
	});
}

async function assertRow(
	tx: Transaction,
	table: string,
	form: FormType,
	index?: number,
	...additionalFields: [string, any][]
) {
	if (index !== undefined) {
		let result = await tx.execute(
			sql.raw(`
			SELECT
				EXISTS (
					SELECT
						_index
					FROM
						"${form}"."${table}"
					WHERE
						_index = ${index}
				);
		`),
		);

		const [{ exists }] = result.rows;

		if (Boolean(exists)) return index;
	}

	const cols = sequences[form][table];
	const result = await tx.execute(
		sql.raw(`
    INSERT INTO "${form}"."${table}"
        (${[...cols, ...additionalFields.map(([k]) => ({ column: k }))].map(({ column }) => `"${column}"`).join(",")})
    VALUES
        (${[...cols.map(({ sequence }) => `nextval('${sequence.schema}.${sequence.seqName}')`), ...additionalFields.map(([_, v]) => v)].join(",")})
    RETURNING _index;
`),
	);
	const [{ _index }] = result.rows;
	return Number(_index);
}

async function assertRowUsingKey(
	tx: Transaction,
	index: number,
	sampleField: string,
	form: FormType,
	...additionalFields: [string, any][]
) {
	const mapping = await lookupMapping(sampleField, form, tx);
	if (!mapping) throw new Error(`Mapping not found for field: ${sampleField}`);

	const { dbTable: table } = mapping;

	return await assertRow(tx, table, form, index, ...additionalFields);
}

async function deleteSubmission(
	tx: Transaction,
	{ form, index }: Extract<FormSubmissionUpdateRequest, { type: "delete" }>,
) {
	if (index.length == 0) return;
	await tx.execute(
		sql.raw(
			`DELETE FROM "${form}"."data" WHERE _index IN (${index.join(",")}); `,
		),
	);
}

async function updateSubmission(
	tx: Transaction,
	{
		changes,
		form,
		index,
	}: Extract<FormSubmissionUpdateRequest, { type: "update" }>,
) {
	let _index = index;

	for (const [key, value] of Object.entries(changes)) {
		const [mapping] = await tx
			.select()
			.from(fieldMappings)
			.where(and(eq(fieldMappings.form, form), eq(fieldMappings.field, key)));

		if (!mapping)
			throw new Error(`Mapping for key: ${key} not found. Update aborted`);
		_index = await assertRow(tx, mapping.dbTable, form, _index);

		await tx.execute(
			sql.raw(
				`UPDATE "${form}"."${mapping.dbTable}" SET "${mapping.dbColumn}" = CAST('${value}' as ${mapping.dbColumnType}) WHERE _index = ${index};`,
			),
		);
	}
}

export async function processChangeRequest(arg: FormSubmissionUpdateRequest) {
	const db = provideDatabase({ fieldMappings });
	await db.transaction(async (tx) => {
		if (arg.type == "delete") await deleteSubmission(tx, arg);
		else if (arg.type == "update") await updateSubmission(tx, arg);
	});
}

export async function findIndexSuggestions({
	form,
	query,
}: FindIndexSuggestionsRequest) {
	const db = provideDatabase({ vwFormSubmissions });
	const result = await db
		.select({
			index: vwFormSubmissions.index,
		})
		.from(vwFormSubmissions)
		.where(
			and(
				eq(vwFormSubmissions.form, form),
				like(sql<string>`${vwFormSubmissions.index}::TEXT`, `%${query}%`),
			),
		)
		.orderBy(vwFormSubmissions.index)
		.limit(5);

	return FindIndexSuggestionsResponseSchema.parse(
		result.map(({ index }) => index),
	);
}

export async function findSubmissionRef({
	form,
	index,
}: FindSubmissionRefRequest) {
	const db = provideDatabase({ vwFormSubmissions });
	const [result] = await db
		.select({
			next: vwFormSubmissions.next,
			prev: vwFormSubmissions.prev,
		})
		.from(vwFormSubmissions)
		.where(
			and(eq(vwFormSubmissions.index, index), eq(vwFormSubmissions.form, form)),
		);

	return [result?.prev ?? null, result?.next ?? null];
}

export async function findAutocompleteSuggestions({
	form,
	query,
	resultSize,
	field,
}: GetAutoCompletionSuggestionsRequest) {
	const db = provideDatabase({ fieldMappings });
	const [mapping] = await db
		.select()
		.from(fieldMappings)
		.where(and(eq(fieldMappings.form, form), eq(fieldMappings.field, field)))
		.limit(1);

	if (!mapping)
		throw new Error(`Mapping not found for field: ${field} and form: ${form}`);

	let resultSet = await db.execute(
		sql`SELECT FORMAT('SELECT UPPER(d.%I::TEXT) AS result FROM %I.%I d WHERE LOWER(d.%I) LIKE LOWER(%L) ORDER BY UPPER(d.%I::TEXT) ASC LIMIT %L::INTEGER', ${mapping.dbColumn}::TEXT, ${form}::TEXT, ${mapping.dbTable}::TEXT, ${mapping.dbColumn}::TEXT, ${"%" + query + "%"}::TEXT, ${mapping.dbColumn}::TEXT, ${resultSize}::INTEGER);`,
	);
	const [{ format }] = resultSet.rows;

	resultSet = await db.execute(format as string);
	const result = resultSet.rows.map(({ result }) => result);

	return GetAutoCompletionSuggestionsResponseSchema.parse(result);
}

export async function findFormData(form: FormType, index: number) {
	const db = provideDatabase({ fieldMappings });
	const mappings = await db
		.select({
			col: fieldMappings.dbColumn,
			table: fieldMappings.dbTable,
			field: fieldMappings.field,
			alias: fieldMappings.aliasHash
		})
		.from(fieldMappings)
		.where(eq(fieldMappings.form, form))
		.$withCache();

	const tableGroups = mappings.reduce(
		(acc, mapping) => {
			if (!acc[mapping.table]) {
				acc[mapping.table] = [];
			}
			acc[mapping.table].push(mapping);
			return acc;
		},
		{} as Record<string, UnwrapArray<typeof mappings>[]>,
	);

	const map: Record<string, any> = {};
	const tablePromises: Promise<void>[] = [];

	for (const [tableName, mappings] of Object.entries(tableGroups)) {
		const isDataTable = tableName == "data";
		const tableAlias = "res";
		const selection = mappings
			.map((f) => `${tableAlias}."${f.col}"::TEXT AS "${f.alias}"`)
			.join(",\n\t\t\t\t");
		const indexCol = isDataTable ? "_index" : "_parent_index";
		const whereClause = `${tableAlias}."${indexCol}" = ${index}`;
		const promise = db
			.execute(
				sql.raw(`
			SELECT
				${selection}
			FROM "${form}"."${tableName}" ${tableAlias}
			WHERE
				${whereClause};
			`),
			)
			.then((result) => {
				const { rows } = result;
				if (isDataTable) {
					const row = rows[0] as Record<string, string> | undefined;
					if (row) {
						for (const { field, alias } of mappings.map(({ field, alias }) => ({ field, alias }))) {
							map[field] = row[alias] ?? null;
						}
					}
				} else {
					const valuesByField: Record<string, string[]> = {};
					for (const row of rows as Record<string, string>[]) {
						for (const { field, alias } of mappings.map(({ field, alias }) => ({ field, alias }))) {
							if (!valuesByField[field]) {
								valuesByField[field] = [];
							}
							valuesByField[field].push(row[alias] ?? null);
						}
					}

					for (const field of mappings) {
						map[field.field] = [
							...(map[field.field] ?? []),
							...(valuesByField[field.field] ?? []),
						];
					}
				}
			});
		tablePromises.push(promise);
	}

	await Promise.all(tablePromises);
	console.log(map);
	return FindSubmissionDataResponseSchema.parse(map);
}

export async function updateFieldMappings(
	form: FormType,
	specs: FieldUpdateSpec[],
) {
	const db = provideDatabase({ vwDbColumns, fieldMappings });
	return await db.transaction(async (tx) => {
		for (const spec of specs) {
			const [dbSpec] = await tx
				.select()
				.from(vwDbColumns)
				.where(
					and(
						eq(vwDbColumns.form, form),
						eq(vwDbColumns.name, spec.dbColumn),
						eq(vwDbColumns.tableName, spec.table),
					),
				);
			if (!dbSpec) {
				throw new Error(
					"Database column datatype could not be determined for column: " +
					spec.dbColumn,
				);
			}
			return await tx
				.insert(fieldMappings)
				.values({
					dbColumn: spec.dbColumn,
					dbColumnType: dbSpec.dataType,
					dbTable: spec.table,
					field: spec.field,
					form,
					i18nKey: spec.field,
				})
				.onConflictDoUpdate({
					target: [fieldMappings.field, fieldMappings.form],
					set: {
						dbColumnType: dbSpec.dataType,
						dbColumn: dbSpec.name,
						dbTable: dbSpec.tableName,
						i18nKey: spec.field,
					},
				})
				.returning();
		}
	});
}

export async function findDbColumns(form: FormType) {
	const db = provideDatabase({ vwDbColumns });
	return await db
		.select({
			name: vwDbColumns.name,
			dataType: vwDbColumns.dataType,
			tableName: vwDbColumns.tableName,
		})
		.from(vwDbColumns)
		.where(eq(vwDbColumns.form, form));
}

export async function findFormOptions(form: FormType) {
	const db = provideDatabase({ choices });
	const result = await db
		.select({
			label: choices.label,
			value: choices.name,
			parent: choices.parent,
			i18nKey: choices.i18NKey,
			group: choices.group,
		})
		.from(choices)
		.where(eq(choices.version, form))
		.$withCache()
		.then((v) => {
			const map: Record<string, Option[]> = {};
			v.forEach((x) => {
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
	return await db
		.select()
		.from(fieldMappings)
		.where(eq(fieldMappings.form, type))
		.$withCache()
		.then((v) => FieldMappingSchema.array().parse(v));
}

export async function findFormSubmissions(
	form: FormType,
	page: number = 0,
	size: number = 100,
	filterQuery: string = "",
) {
	const db = provideDatabase({ vwFormSubmissions });
	const q = `%${filterQuery.toLowerCase()}%`;
	const filter = filterQuery
		? and(
			eq(vwFormSubmissions.form, form),
			or(
				like(sql`LOWER(${vwFormSubmissions.index}::TEXT)`, q),
				like(sql`LOWER(${vwFormSubmissions.validationCode})`, q),
				like(sql`LOWER(${vwFormSubmissions.facilityName})`, q),
			),
		)
		: eq(vwFormSubmissions.form, form);

	const submissions = await db
		.select()
		.from(vwFormSubmissions)
		.where(filter)
		.limit(size)
		.offset(page * size);
	const [{ totalRecords }] = await db
		.select({ totalRecords: countDistinct(vwFormSubmissions.index) })
		.from(vwFormSubmissions)
		.where(filter);

	const schema = createPaginatedResultSchema(FormSubmissionSchema);
	return schema.parse({ totalRecords, data: submissions });
}
