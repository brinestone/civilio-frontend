import { hashThese } from '@civilio/helpers/hashing';
import { provideLogger } from '@civilio/helpers/logging';
import {
	chefferieIndexSeqInCivilio,
	chefferiePersonnelIndexSeqInCivilio,
	choices,
	cscIdSeqInCivilio,
	cscIndexSeqInCivilio,
	cscPersonnelIndexSeqInCivilio,
	cscPiecesIndexSeqInCivilio,
	cscStatisticsIndexSeqInCivilio,
	cscVillagesSeqInCivilio,
	deltaChanges,
	fieldMappings,
	fosaIdSeqInCivilio,
	fosaIndexSeqInCivilio,
	fosaPersonnelIndexSeqInCivilio,
	vwDbColumns,
	vwFacilities,
	vwFormSubmissions,
} from "@civilio/schema";
import {
	createPaginatedResultSchema,
	DeleteSubmissionRequest,
	FieldMappingSchema,
	FieldUpdateSpec,
	FindIndexSuggestionsRequest,
	FindIndexSuggestionsResponseSchema,
	FindSubmissionCurrentVersionRequest,
	FindSubmissionCurrentVersionResponseSchema,
	FindSubmissionDataRequest,
	FindSubmissionDataResponseSchema,
	FindSubmissionRefRequest,
	FindSubmissionVersionsRequest,
	FindSubmissionVersionsResponseSchema,
	FormSubmissionSchema,
	FormType,
	GetAutoCompletionSuggestionsRequest,
	GetAutoCompletionSuggestionsResponseSchema,
	GetFacilityInfoRequest,
	GetFacilityInfoResponseSchema,
	InitializeSubmissionVersionRequest,
	InitializeSubmissionVersionResponseSchema,
	Option,
	OptionSchema,
	RemoveFieldMappingRequest,
	ToggleApprovalStatusRequest,
	UpdateSubmissionRequest,
	VersionExistsRequest,
	VersionExistsRequestSchema,
	VersionRevertRequest
} from "@civilio/shared";
import {
	and,
	countDistinct,
	eq,
	inArray,
	like,
	or,
	SQL,
	sql
} from "drizzle-orm";
import { PgSequence } from "drizzle-orm/pg-core";
import { entries, groupBy, keys, values } from 'lodash';
import { provideDatabase } from "../helpers/db";

const logger = provideLogger('forms');

const sequences: Record<
	string,
	Record<string, { column: string; sequence: PgSequence }[]>
> = {
	fosa: {
		data: [
			{ column: "_index", sequence: fosaIndexSeqInCivilio },
			{ column: '_id', sequence: fosaIdSeqInCivilio }
		],
		data_personnel: [
			{ column: "_index", sequence: fosaPersonnelIndexSeqInCivilio },
		],
	},
	csc: {
		data: [
			{ column: "_index", sequence: cscIndexSeqInCivilio },
			{ column: "_id", sequence: cscIdSeqInCivilio },
		],
		data_archives: [
			{ column: '_index', sequence: cscIndexSeqInCivilio }
		],
		data_personnel: [
			{ column: '_index', sequence: cscPersonnelIndexSeqInCivilio }
		],
		data_pieces: [
			{ column: '_index', sequence: cscPiecesIndexSeqInCivilio },
		],
		data_statistiques: [
			{ column: '_index', sequence: cscStatisticsIndexSeqInCivilio }
		],
		data_villages: [
			{ column: '_index', sequence: cscVillagesSeqInCivilio }
		]
	},
	chefferie: {
		data: [
			{ column: '_index', sequence: chefferieIndexSeqInCivilio },
			// { column: '_id', sequence: chefferieIdSeqInCivilio }
		],
		data_personnel: [
			{ column: '_index', sequence: chefferiePersonnelIndexSeqInCivilio }
		]
	}
};

export async function findAllFormOptions(form: string) {
	const db = provideDatabase({ choices });
	return Array<{
		group: string;
		value: string;
		label?: string;
		parent?: string;
		i18nKey?: string;
	}>();
}

export async function versionExists(req: VersionExistsRequest) {
	const { form, index, version } = VersionExistsRequestSchema.parse(req);
	const db = provideDatabase({ deltaChanges });
	const result = await db.execute<{ exists: boolean }>(sql`
		SELECT EXISTS(SELECT 1
									FROM ${ deltaChanges }
									WHERE ${ and(
										eq(deltaChanges.submissionIndex, index),
										eq(deltaChanges.hash, version),
										eq(deltaChanges.form, form)
									)
												}) AS exists
	`);

	return result.rows[0].exists;
}

export async function deleteSubmission({
																				 form,
																				 index
																			 }: DeleteSubmissionRequest) {
	const db = provideDatabase({});
	await db.transaction(async tx => {
		//language=PostgreSQL
		const result = await tx.execute(sql`
			SELECT revisions.get_record_current_version(${ form },
																									${ index }::INTEGER) AS version
		`);
		const [{ version: currentVersion }] = result.rows;
		const newVersion = hashThese([Date.now()].join('|'));
		logger.debug('new version = ', newVersion);
		logger.debug('parent version = ', currentVersion);
		const _configs = {
			'session.working_version': newVersion,
			'session.actor': 'civilio', // TODO: use the id from identity provider
			'session.notes': 'Deleted',
			'session.parent_version': currentVersion,
		};
		for (const [k, v] of entries(_configs)) {
			await tx.execute(sql`SELECT set_config(${ k }, ${ v }, true)`);
		}

		await tx.execute(sql`
			DELETE
			FROM ${ sql.identifier(form) }."data"
			WHERE _index = ${ index }::INTEGER
		`);
	})
}

export async function toggleApprovalStatus({
																						 form, index, value
																					 }: ToggleApprovalStatusRequest) {
	const db = provideDatabase({});
	await db.transaction(tx => tx.execute(sql`
		UPDATE ${ sql.identifier(form) }."data"
		SET _validation_status = ${ value ? 'validation_status_approved' : 'validation_status_not_approved' }
		WHERE _index = ${ index }::INTEGER
	`));
}

export async function getSubmissionInfo({
																					form,
																					index
																				}: GetFacilityInfoRequest) {
	const db = provideDatabase({ vwFacilities });
	const [result] = await db.select().from(vwFacilities).where(and(
		eq(vwFacilities.index, index as number),
		eq(vwFacilities.type, form)
	)).limit(1);
	return GetFacilityInfoResponseSchema.parse(result ?? null);
}

export async function revertSubmissionVersion({
																								customVersion,
																								targetVersion,
																								index,
																								form,
																								changeNotes
																							}: VersionRevertRequest) {
	const db = provideDatabase({ deltaChanges });
	return await db.transaction(async tx => {
		await tx.execute(sql`
	CALL revisions.revert_submission(
	       ${ form },
	       ${ index },
	       ${ targetVersion },
	       ${ changeNotes },
	       'civilio',
	       ${ customVersion || null }
	);
	`);
	});
}

export async function processSubmissionDataUpdate(req: UpdateSubmissionRequest) {
	const {
		submissionIndex,
		form,
		deltas,
		changeNotes,
		parentVersion,
		customVersion
	} = req;
	logger.debug('dto: ', req);
	const db = provideDatabase({ fieldMappings, deltaChanges });
	return await db.transaction(async tx => {
		let newVersion = customVersion || hashThese([JSON.stringify(deltas), Date.now()].join('|'));
		logger.debug('new version = ', newVersion);
		logger.debug('parent version = ', parentVersion);
		const _configs = {
			'session.working_version': newVersion,
			'session.actor': 'civilio', // TODO: use the id from identity provider
			'session.notes': changeNotes,
			'session.parent_version': parentVersion,
		};
		for (const [k, v] of entries(_configs)) {
			// language=PostgreSQL
			await tx.execute(sql`SELECT set_config(${ k }, ${ v ?? null }, true)`);
		}
		logger.debug(`All deltas: ${ deltas.length }`);
		let _submission_index = Number(submissionIndex);
		const isNew = _submission_index == 0;
		const allMappings = await tx.select().from(fieldMappings).where(
			eq(fieldMappings.form, form)
		);
		const tableGroupedMappings = groupBy(allMappings, 'dbTable');
		if (isNew) {
			const dataTableMappings = tableGroupedMappings['data'];
			const tableDeltas = deltas.filter(delta => {
				return dataTableMappings.some(mapping => mapping.field == delta.field);
			});
			const dataEntries = tableDeltas.reduce((acc, curr) => {
				const mapping = dataTableMappings.find(m => m.field == curr.field)!;
				acc[mapping.dbColumn] = sql`${ curr.value || null }::${ sql.raw(mapping.dbColumnType) }`;
				return acc;
			}, {} as Record<string, SQL>)
			const requiredCols = sequences[form].data;
			const columns = [...requiredCols.map(c => sql.identifier(c.column)), ...keys(dataEntries).map(k => sql.identifier(k))]
			const dataValues = [...requiredCols.map(c => sql.raw(`nextval('${ c.sequence.schema }.${ c.sequence.seqName }')`)), ...values(dataEntries)]

			const result = await tx.execute(sql`
				INSERT INTO ${ sql.identifier(form) }."data" ("_submission_time", ${ sql.join(columns, sql`,
																			`) })
				VALUES (NOW(),
								${ sql.join(dataValues, sql`,
								`) })
				RETURNING _index;
			`);
			if (result.rows.length == 0) {
				throw new Error('An unexpected error occurred. Please try again later or contact your administrator')
			}
			_submission_index = result.rows[0]._index as number;

			//language=PostgreSQL
			await tx.execute(sql`
				CALL revisions.sync_version(${ form }, ${ _submission_index });
			`);
		}
		for (const [table, mappings] of entries(tableGroupedMappings)) {
			if (isNew && table == 'data') continue;
			const tableDeltas = deltas.filter(delta => {
				const fieldToCheck = (delta.op === 'add' && delta.identifierKey)
					? delta.identifierKey
					: delta.field;
				return mappings.some(mapping => mapping.field === fieldToCheck);
			});
			logger.debug(`Processing ${ tableDeltas.length } updates for table: ${ table }`);
			logger.debug(`Table Deltas: ${ JSON.stringify(tableDeltas) }`);
			if (table == 'data' && tableDeltas.length > 0) {
				const kvm = new Map<string, [any, string]>();
				for (const delta of tableDeltas) {
					const mapping = mappings.find(m => m.field == delta.field);
					if (!mapping) continue;
					kvm.set(mapping.dbColumn, [delta.value, mapping.dbColumnType])
				}
				const updates = [...kvm.entries().map(([col, [v, t]]) => sql`${ sql.identifier(col) } = ${ v || null }::${ sql.raw(t) }`)];
				await tx.execute(sql`
					UPDATE ${ sql.identifier(form) }.${ sql.identifier('data') }
					SET ${ sql.join(updates, sql`, `) }
					WHERE _index = ${ _submission_index };
				`);
				//language=PostgreSQL
				await tx.execute(sql`
					CALL revisions.sync_version(${ form }, ${ _submission_index });
				`);
			} else if (table != 'data' && tableDeltas.length > 0) {
				const {
					add: additions,
					delete: deletions,
					update: updates
				} = groupBy(tableDeltas, 'op');
				if (updates && updates.length > 0) {
					logger.debug('processing "update" deltas');
					const recordGroups = groupBy(updates, 'index');
					for (const [i, updates] of entries(recordGroups)) {
						const kvm = new Map<string, [any, string]>();
						for (const update of updates) {
							const mapping = mappings.find(m => m.field == update.field);
							if (!mapping) continue;
							kvm.set(mapping.dbColumn, [update.value, mapping.dbColumnType]);
						}
						const updateClauses = [...kvm.entries()].map(
							([col, [v, t]]) => sql`${ sql.identifier(col) } = ${ v || null }::${ sql.raw(t) }`
						);
						await tx.execute(sql`
							UPDATE ${ sql.identifier(form) }.${ sql.identifier(table) }
							SET ${ sql.join(updateClauses, sql`, `) }
							WHERE _parent_index = ${ _submission_index }::INTEGER
								AND _index = ${ i }::INTEGER;
						`);
					}
					//language=PostgreSQL
					await tx.execute(sql`
						CALL revisions.sync_version(${ form }, ${ _submission_index });
					`);
				}
				if (additions && additions.length > 0) {
					logger.debug('processing "add" deltas');
					const uniqueMappings = additions.flatMap(a => keys(a.value))
						.reduce((acc, k) => {
							const mapping = mappings.find(m => m.field == k);
							if (mapping) {
								acc[k] = mapping;
							}
							return acc;
						}, {} as Record<string, typeof allMappings[0]>);
					const identifierMapping = mappings.find(m => m.field == additions[0].identifierKey);
					if (!identifierMapping) {
						throw new Error('Could not identify identifier mapping. Cannot proceed');
					}
					for (const row of additions) {
						logger.debug('row', row);
						const kvm = new Map<string, [any, string]>();
						const rowEntries = entries(row.value);
						logger.debug(rowEntries);
						for (const [field, value] of rowEntries) {
							const mapping = uniqueMappings[field];
							if (mapping) {
								kvm.set(mapping.dbColumn, [value, mapping.dbColumnType]);
							}
						}
						logger.debug('kvm', kvm);
						logger.debug('unique mappings', uniqueMappings);
						const cols = [...sequences[form][table].map(({ column }) => column), ...kvm.keys(), '_parent_index'].map(c => sql.identifier(c));
						const values = [...sequences[form][table].map(({ sequence }) => sql`nextval('${ sql.join([sql.raw(sequence.schema), sql.raw(sequence.seqName)], sql`.`) }')`), ...[...kvm.values()].map(([v, t]) => sql`${ v || null }::${ sql.raw(t) }`), _submission_index];
						await tx.execute(sql`
							INSERT INTO ${ sql.identifier(form) }.${ sql.identifier(table) } (${ sql.join(cols, sql`, `) })
							VALUES (${ sql.join(values, sql`,
											`) });
						`);
					}
					//language=PostgreSQL
					await tx.execute(sql`
						CALL revisions.sync_version(${ form }, ${ _submission_index });
					`);
				}
				if (deletions && deletions.length > 0) {
					logger.debug('processing "delete" deltas');
					let identifierMapping = mappings.find(m => m.field == deletions[0].field);
					if (!identifierMapping) {
						throw new Error('Could not identify identifier mapping. Cannot proceed');
					}
					const indexes = deletions
						.map(({
										field,
										index
									}) => ({
							mapping: mappings.find(m => m.field == field),
							index
						}))
						.filter(({ mapping }) => !!mapping)
						.map(({ index }) => index);
					await tx.execute(sql`
						DELETE
						FROM ${ sql.identifier(form) }.${ sql.identifier(table) }
						WHERE ${ and(
							eq(sql.identifier('_parent_index'), _submission_index),
							inArray(sql.identifier(identifierMapping.dbColumn), indexes)
						) }
					`);
					//language=PostgreSQL
					await tx.execute(sql`
						CALL revisions.sync_version(${ form }, ${ _submission_index });
					`);
				}
			}
		}

		return _submission_index;
	});
}

export async function initializeSubmissionVersioning({
																											 form,
																											 index
																										 }: InitializeSubmissionVersionRequest) {
	const db = provideDatabase({});
	//language=PostgreSQL
	const queryResult = await db.execute(sql`SELECT revisions.func_log_submission_state(
																										${ index },
																										${ form }::civilio.form_types) AS version`);
	return InitializeSubmissionVersionResponseSchema.parse(queryResult.rows[0]?.version ?? null);
}

export async function findCurrentSubmissionVersion({
																										 form,
																										 index
																									 }: FindSubmissionCurrentVersionRequest) {
	const db = provideDatabase({});
	const queryResult = await db.execute(sql`
		SELECT d.*
		FROM revisions.get_version_chain(${ index },
																		 ${ form }::civilio.form_types) d
		WHERE d.is_current = true
		LIMIT 1;
	`);

	return FindSubmissionCurrentVersionResponseSchema.parse(queryResult.rows[0] ?? null);
}

export async function findSubmissionVersions({
																							 form,
																							 index,
																							 limit,
																							 changeOffset
																						 }: FindSubmissionVersionsRequest) {
	const db = provideDatabase({});

	const queryResult = await db.execute(sql`
		SELECT d.*
		FROM revisions.get_version_chain(${ index },
																		 ${ form }::civilio.form_types) d
		WHERE d.changed_at <= COALESCE(${ changeOffset ?? null }, NOW())
		LIMIT ${ limit };
	`);

	return FindSubmissionVersionsResponseSchema.parse(queryResult.rows);
}

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
				like(sql<string>`${ vwFormSubmissions.index }::TEXT`, `%${ query }%`),
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
			and(eq(vwFormSubmissions.index, Number(index)), eq(vwFormSubmissions.form, form)),
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
		throw new Error(`Mapping not found for field: ${ field } and form: ${ form }`);

	let resultSet = await db.execute(
		sql`SELECT FORMAT(
								 'SELECT UPPER(d.%I::TEXT) AS result FROM %I.%I d WHERE LOWER(d.%I) LIKE LOWER(%L) ORDER BY UPPER(d.%I::TEXT) ASC LIMIT %L::INTEGER',
								 ${ mapping.dbColumn }::TEXT, ${ form }::TEXT,
								 ${ mapping.dbTable }::TEXT, ${ mapping.dbColumn }::TEXT,
								 ${ "%" + query + "%" }::TEXT, ${ mapping.dbColumn }::TEXT,
								 ${ resultSize }::INTEGER);`,
	);
	const [{ format }] = resultSet.rows;

	resultSet = await db.execute(format as string);
	const result = resultSet.rows.map(({ result }) => result);

	return GetAutoCompletionSuggestionsResponseSchema.parse(result);
}

export async function findFormData({
																		 form,
																		 index,
																		 version
																	 }: FindSubmissionDataRequest) {
	const db = provideDatabase({ fieldMappings });
	let result = {} as Record<string, any>;
	let queryResult = await db.execute(sql`
		SELECT DISTINCT t.table_name::TEXT as t
		FROM information_schema.tables t
		WHERE t.table_schema = ${ form };
	`);
	const tableNames = queryResult.rows.map(row => row.t as string);
	for (const tableName of tableNames) {
		// language=PostgreSQL
		queryResult = await db.execute(sql`
			SELECT revisions.get_version_data(${ form }::civilio.form_types,
																				${ index }, ${ tableName },
																				${ version || null }) AS "data";
		`);
		const row = queryResult.rows[0]?.data as any;
		if (!row) continue;
		result = { ...result, ...row };
	}
	return FindSubmissionDataResponseSchema.parse(result);
}

export async function updateFieldMappings(
	form: FormType,
	specs: FieldUpdateSpec[],
) {
	const db = provideDatabase({ vwDbColumns, fieldMappings });
	return await db.transaction(async (tx) => {
		const retVal: any[] = [];
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
			retVal.push(await tx
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
				.returning());
		}
		return retVal.flatMap(v => v);
	});
}

export async function findDbColumns(form: FormType) {
	const db = provideDatabase({ vwDbColumns });
	return db
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
	return await db
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
	try {
		const db = provideDatabase({ vwFormSubmissions });
		const q = `%${ filterQuery.toLowerCase() }%`;
		const searchColumns = [
			vwFormSubmissions.index,
			vwFormSubmissions.validationCode,
			vwFormSubmissions.facilityName,
			vwFormSubmissions.currentVersion
		];
		const filter = filterQuery
			? and(
				eq(vwFormSubmissions.form, form),
				or(
					...searchColumns.map(col => like(sql`LOWER(${ col }::TEXT)`, q))
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
	} catch (e) {
		console.error(e);
		logger.error(e);
		throw e;
	}
}
