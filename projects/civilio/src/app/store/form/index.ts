import { EnvironmentProviders, inject, Injectable } from "@angular/core";
import { ValidationErrors } from "@angular/forms";
import {
	ColumnDefinition,
	extractAllFields,
	extractFieldKey,
	extractFieldsAsMap,
	extractRawValidators,
	FieldSchema,
	flattenSections,
	FormSchema,
	lookupFieldSchema,
	ParsedValue,
	parseValue,
	RawValue,
	RelevanceDefinition,
	serializeValue,
} from "@app/model/form";
import { FORM_SERVICE } from "@app/services/form";
import {
	FieldKey,
	FieldMapping,
	FindDbColumnsResponse,
	FindFormOptionsResponse,
	FindSubmissionDataResponse,
	FormSectionKey,
	FormType,
	SubmissionChangeDeltaInput,
	SubmissionChangeDeltaSchema,
	toRowMajor,
} from "@civilio/shared";
import {
	Action,
	provideStates,
	State,
	StateContext,
	StateToken,
} from "@ngxs/store";
import { insertItem, patch } from "@ngxs/store/operators";
import {
	cloneDeep,
	differenceBy,
	entries,
	get,
	intersectionBy,
	keys,
	last,
	omit,
	set,
	values
} from "lodash";
import { concat, concatMap, EMPTY, filter, from, switchMap, tap } from "rxjs";
import { deleteByKey } from "../operators";
import {
	ActivateForm,
	ActivateSection,
	DeactivateForm,
	DiscardChanges,
	InitVersioning,
	LoadDbColumns,
	LoadMappings,
	LoadOptions,
	LoadSubmissionData,
	RecordDeltaChange,
	Redo,
	RemoveMapping,
	SaveChanges,
	SetFormType,
	SubmissionIndexChanged,
	Undo,
	UpdateFormDirty,
	UpdateMappings,
	UpdateRelevance,
	UpdateSection,
	UpdateValidity,
} from "./actions";

export * from "./actions";
export type SectionForm = {
	model: Record<string, unknown>;
	dirty: boolean;
	status: "INVALID" | "VALID" | "PENDING" | "DISABLED";
	errors: Record<string, ValidationErrors | null>;
};

type DeltaChange = {
	path: string,
	oldValue: any,
	newValue: any,
	op: 'update' | 'delete' | 'add'
};
type FormStateModel = {
	mappings?: Record<FormType, Record<string, FieldMapping>>;
	options?: Record<FormType, FindFormOptionsResponse>;
	columns?: Record<FormType, FindDbColumnsResponse>;
	currentSection?: FormSectionKey;
	lastFocusedFormType: FormType;
	rawData?: Record<
		string,
		| ParsedValue[]
		| ParsedValue
		| Record<string, ParsedValue[] | ParsedValue | null>[]
		| null
	>;
	schemas: Record<string, FormSchema>;
	activeSections: Record<string, SectionForm>;
	relevanceRegistry: Record<string, boolean>;
	workingVersion?: string;
	undoStack: DeltaChange[];
	redoStack: DeltaChange[];
};
export const FORM_STATE = new StateToken<FormStateModel>("form");
type Context = StateContext<FormStateModel>;

function computeRelevance(
	rawValueSupplier: (
		k: string,
	) =>
		| ParsedValue
		| ParsedValue[]
		| Record<string, ParsedValue | ParsedValue[]>[]
		| null,
	formValueSupplier: (k: string) => ParsedValue | ParsedValue[],
	formSchema: FormSchema,
	definition?: RelevanceDefinition,
) {
	if (!definition) {
		return true;
	}

	const { dependencies, predicate } = definition;
	const deps = dependencies.reduce(
		(acc, curr) => {
			const _schema = lookupFieldSchema(curr, formSchema);
			if (!_schema) return acc;
			const formValue = formValueSupplier(curr);
			const pristineValue = rawValueSupplier(curr);
			return { ...acc, [curr]: formValue ?? pristineValue };
		},
		{} as Record<FieldKey, ParsedValue | ParsedValue[]>,
	);

	return predicate(deps as any);
}

function computeForSectionFlatKey(k: FormSectionKey) {
	return k;
}

function makeChangePath(segments: (string | number)[]) {
	return segments.join('/');
}

function splitChangePath(path: string) {
	return path.split("/");
}

@Injectable()
@State({
	name: FORM_STATE,
	defaults: {
		lastFocusedFormType: "csc",
		activeSections: {},
		schemas: {},
		relevanceRegistry: {},
		undoStack: [],
		redoStack: []
	},
})
class FormState {
	private readonly formService = inject(FORM_SERVICE);

	@Action(SaveChanges)
	onSaveChanges(ctx: Context, { form, changeNotes, index }: SaveChanges) {
		const deltas = this.extractDeltas(ctx, ctx.getState().schemas[form], index);
		const { activeSections } = ctx.getState();
		return from(this.formService.updateFormSubmission({
			changeNotes,
			form,
			submissionIndex: index,
			deltas,
			parentVersion: ctx.getState().workingVersion
		})).pipe(
			tap(() => ctx.setState(patch({
				undoStack: [],
				redoStack: [],
				activeSections: patch({
					...Object.fromEntries(
						entries(activeSections)
							.filter(([_, { dirty }]) => dirty)
							.map(([k, s]) => ([k, { ...s, dirty: false }])))
				})
			})))
		);
	}

	private extractDeltas(ctx: Context, formSchema: FormSchema, submissionIndex?: number | string) {
		const deltas: SubmissionChangeDeltaInput[] = [];
		const { activeSections, rawData } = ctx.getState();
		const fields = extractFieldsAsMap(formSchema);
		if (submissionIndex === undefined) {
			for (const [fieldKey, value] of values(activeSections).flatMap(e => entries(e.model))) {
				const schema = fields[fieldKey];
				if (schema.type != 'table') {
					deltas.push({
						field: fieldKey,
						op: 'add',
						value: serializeValue(schema, value)
					})
				} else {
					for (const row of (value as Record<string, any>[])) {
						deltas.push({
							op: 'add',
							identifierKey: schema.identifierColumn,
							value: omit(row, schema.identifierColumn)
						});
					}
				}
			}
		} else {
			for (const [fieldKey, value] of values(activeSections).filter(s => s.dirty).flatMap(e => entries(e.model))) {
				const schema = fields[fieldKey];
				if (schema.type != 'table') {
					if (value === rawData?.[fieldKey]) continue;
					deltas.push({
						field: fieldKey,
						op: 'update',
						value: serializeValue(schema, value),
						index: submissionIndex,
					});
				} else {
					const collection = value as Record<string, any>[];
					const deletedDeltas = differenceBy(rawData?.[fieldKey] as typeof collection, collection, schema.identifierColumn);
					const addedRows = differenceBy(collection, rawData?.[fieldKey] as typeof collection, schema.identifierColumn);
					const updatedRows = intersectionBy(collection, rawData?.[fieldKey] as typeof collection, schema.identifierColumn);

					for (let i = 0; i < updatedRows.length; i++) {
						const row = updatedRows[i];
						const rawRow = (rawData?.[fieldKey] as Record<string, any>[]).find(r => r[schema.identifierColumn] == row[schema.identifierColumn])!;
						for (const [colKey, colValue] of entries(row)) {
							if (colKey == schema.identifierColumn) continue;
							if (rawRow[colKey] == colValue) continue;
							deltas.push({
								index: row[schema.identifierColumn],
								op: "update",
								field: colKey,
								value: colValue,
							})
						}
					}

					for (const row of deletedDeltas) {
						deltas.push({
							index: row[schema.identifierColumn],
							op: 'delete',
							field: schema.identifierColumn
						});
					}

					for (const row of addedRows) {
						deltas.push({
							op: 'add',
							identifierKey: schema.identifierColumn,
							value: omit(row, schema.identifierColumn)
						});
					}
				}
			}
		}
		return SubmissionChangeDeltaSchema.array().parse(deltas);
	}

	@Action(DiscardChanges)
	onDiscardChanges(ctx: Context, { form }: DiscardChanges) {
		const { activeSections, rawData } = ctx.getState();
		return concat(
			from(entries(activeSections)).pipe(
				filter(([_, { dirty }]) => dirty),
				tap(([sectionKey]) => ctx.setState(patch({
					undoStack: [],
					redoStack: [],
					activeSections: patch({
						[sectionKey]: patch({
							dirty: false
						})
					})
				}))),
				switchMap(([sectionKey, section]) => from(entries(section.model)).pipe(
					tap(([k]) => {
						ctx.setState(patch({
							activeSections: patch({
								[sectionKey]: patch({
									model: patch({
										[k]: rawData?.[k]
									})
								})
							})
						}))
					}),
				))
			),
			ctx.dispatch(new UpdateRelevance(form))
		);
	}

	// NOTE: redo-ing an addition is the same as undo-ing a deletion and vice versa

	/**
	 * Re-applies the change moved from the redoStack to the undoStack.
	 */
	@Action(Redo)
	onRedo(ctx: Context, { form }: Redo) {
		const state = ctx.getState();
		if (state.redoStack.length == 0) return;
		const [lastChange, ...newRedoStack] = state.redoStack;
		const [section, ...path] = splitChangePath(lastChange.path);

		// CRITICAL: Clone activeSections to maintain state immutability
		let activeSectionsClone = cloneDeep(state.activeSections);

		const actualPath = [section, 'model', ...path];

		if (lastChange.op == 'update') {
			// Redo update: apply the newValue
			set(activeSectionsClone, actualPath, lastChange.newValue);
		} else if (lastChange.op == 'delete') {
			// Redo delete: remove the item at the specific index
			const parentPath = actualPath.slice(0, -1);
			const index = Number(last(actualPath));
			const arr = get(activeSectionsClone, parentPath) as any[];
			// Immutable array deletion using filter
			const updatedArr = arr.filter((_, i) => i !== index);
			set(activeSectionsClone, parentPath, updatedArr);
		} else { // op == 'add'
			// Redo add: insert the item (newValue) back at the specific index
			const index = Number(last(actualPath));
			const parentPath = actualPath.slice(0, -1);
			const arr = get(activeSectionsClone, parentPath) as any[];
			// Use splice on the array clone to insert the added item (newValue)
			arr.splice(index, 0, lastChange.newValue);
			set(activeSectionsClone, parentPath, arr);
		}

		ctx.setState(patch({
			activeSections: activeSectionsClone, // Use the updated clone
			redoStack: newRedoStack,
			undoStack: insertItem(lastChange, 0)
		}));
		ctx.dispatch(new UpdateRelevance(form));
	}

	/**
	 * Reverses the change moved from the undoStack to the redoStack.
	 */
	@Action(Undo)
	onUndo(ctx: Context, { form }: Undo) {
		const state = ctx.getState();
		if (state.undoStack.length == 0) return;
		const [lastChange, ...newUndoStack] = state.undoStack;
		const [section, ...path] = splitChangePath(lastChange.path);

		// CRITICAL: Clone activeSections to maintain state immutability
		let activeSectionsClone = cloneDeep(state.activeSections);

		const actualPath = [section, 'model', ...path];

		if (lastChange.op == 'update') {
			// Undo update: restore the oldValue
			set(activeSectionsClone, actualPath, lastChange.oldValue);
		} else if (lastChange.op == 'delete') {
			// Undo delete: restore the deleted item (oldValue) back at the specific index
			const index = Number(last(actualPath));
			const parentPath = actualPath.slice(0, -1);
			const arr = get(activeSectionsClone, parentPath) as any[];
			// Use splice on the array clone to insert the old value
			arr.splice(index, 0, lastChange.oldValue);
			set(activeSectionsClone, parentPath, arr);
		} else {
			const parentPath = actualPath.slice(0, -1);
			const index = Number(last(actualPath));
			const arr = get(activeSectionsClone, parentPath) as any[];
			const updatedArr = arr.filter((_, i) => i !== index);
			set(activeSectionsClone, parentPath, updatedArr);
		}

		ctx.setState(patch({
			activeSections: activeSectionsClone, // Use the updated clone
			undoStack: newUndoStack,
			redoStack: insertItem(lastChange, 0)
		}));
		ctx.dispatch(new UpdateRelevance(form));
	}

	@Action(SubmissionIndexChanged)
	onSubmissionIndexChanged(ctx: Context) {
		ctx.setState(patch({ redoStack: [], undoStack: [] }));
	}

	@Action(RecordDeltaChange, { cancelUncompleted: true })
	onRecordDeltaChange(ctx: Context, {
		event: {
			changeType,
			newValue,
			oldValue,
			path
		}
	}: RecordDeltaChange) {
		ctx.setState(patch({
			undoStack: insertItem({
				path: makeChangePath(path),
				newValue,
				oldValue,
				op: changeType
			}, 0),
			redoStack: []
		}));
	}

	@Action(InitVersioning)
	onInitVersioning(ctx: Context, arg: InitVersioning) {
		return from(this.formService.initializeSubmissionVersion(arg)).pipe(
			concatMap((version) => {
				if (version == null) {
					console.log(`submission does not exist with index: ${ arg.index } in form ${ arg.form }`);
					return EMPTY;
				}
				return ctx.dispatch(new LoadSubmissionData(arg.form, arg.index as any, version));
			})
		)
	}

	@Action(ActivateSection)
	onActivateSection(ctx: Context, { section }: ActivateSection) {
		ctx.setState(
			patch({
				currentSection: section,
			}),
		);
	}

	@Action(DeactivateForm)
	onDeactivateForm(ctx: Context, { form }: DeactivateForm) {
		ctx.setState(
			patch({
				activeSections: {},
				schemas: deleteByKey(form),
				relevanceRegistry: {},
				options: deleteByKey(form),
				rawData: {},
				currentSection: undefined,
				undoStack: [],
				redoStack: []
			}),
		);
	}

	@Action(UpdateFormDirty)
	onUpdateSectionStatus(
		ctx: Context,
		{ dirty, section }: UpdateFormDirty,
	) {
		ctx.setState(
			patch({
				activeSections: patch({
					[section]: patch({
						dirty,
					}),
				}),
			}),
		);
	}

	@Action(UpdateValidity, { cancelUncompleted: true })
	onUpdateValidity(ctx: Context, { form }: UpdateValidity) {
		const { schemas, relevanceRegistry, activeSections } = ctx.getState();
		const formSchema = schemas[form];
		const sections = flattenSections(formSchema);

		for (const section of sections) {
			const isRelevant = relevanceRegistry[section.id];
			const formKey = computeForSectionFlatKey(section.id);
			const form = activeSections[section.id];
			if (!isRelevant || !form) continue;

			let isValid = true;
			for (const field of section.fields) {
				const fieldKey = extractFieldKey(field.key);
				const isRelevant = relevanceRegistry[fieldKey];
				if (!isRelevant) continue;

				const value = form.model[fieldKey];
				const validators = extractRawValidators(field);
				const errors = validators
					.map((fn) => fn(value))
					.filter((v) => v != null);
				isValid = isValid && errors.length == 0;
				if (errors.length > 0)
					ctx.setState(
						patch({
							activeSections: patch({
								[formKey]: patch({
									errors: patch({
										[fieldKey]: errors.reduce((acc, curr) => ({
											...acc,
											...curr,
										})),
									}),
								}),
							}),
						}),
					);
				else
					ctx.setState(
						patch({
							activeSections: patch({
								[formKey]: patch({
									errors: deleteByKey(fieldKey),
								}),
							}),
						}),
					);
			}

			ctx.setState(
				patch({
					activeSections: patch({
						[formKey]: patch({
							status: isValid ? "VALID" : "INVALID",
						}),
					}),
				}),
			);
		}
	}

	@Action(UpdateRelevance, { cancelUncompleted: true })
	onUpdateRelevance(
		ctx: Context,
		{ form, field: affectedField }: UpdateRelevance,
	) {
		const { schemas, rawData, activeSections } = ctx.getState();

		const formSchema = schemas[form];
		let fields = extractAllFields(formSchema);
		let sections = flattenSections(formSchema);
		const formValueSupplier = (k: string) =>
			values(activeSections).find(({ model }) => keys(model).includes(k))
				?.model[k] ?? null;
		const rawValueSupplier = (k: string) => rawData?.[k] ?? null;

		if (affectedField) {
			fields = fields.filter(
				(f) => f.relevance && f.relevance.dependencies.includes(affectedField),
			);
			sections = sections.filter(
				(s) => s.relevance && s.relevance.dependencies.includes(affectedField),
			);
		}
		for (const field of fields) {
			const isRelevant = computeRelevance(
				rawValueSupplier,
				formValueSupplier as any,
				formSchema,
				field.relevance,
			);
			ctx.setState(
				patch({
					relevanceRegistry: patch({
						[extractFieldKey(field.key)]: isRelevant,
					}),
				}),
			);
		}

		for (const section of sections) {
			const isRelevant = computeRelevance(
				rawValueSupplier,
				formValueSupplier as any,
				formSchema,
				section.relevance,
			);
			ctx.setState(
				patch({
					relevanceRegistry: patch({
						[section.id]: isRelevant,
					}),
				}),
			);
		}
		ctx.dispatch(new UpdateValidity(form));
	}

	@Action(UpdateSection, { cancelUncompleted: true })
	onUpdateFormValue(
		ctx: Context,
		{ section, form, value, field }: UpdateSection,
	) {
		ctx.setState(
			patch({
				activeSections: patch({
					[section]: patch({
						model: patch({
							[field]: value,
						}),
					}),
				}),
			}),
		);
		ctx.dispatch(new UpdateRelevance(form, section));
	}

	@Action(ActivateForm)
	onActivateForm(ctx: Context, { schema }: ActivateForm) {
		const sections = flattenSections(schema).filter((s) => s.fields.length > 0);
		ctx.setState(
			patch({
				undoStack: [],
				redoStack: [],
				schemas: patch({
					[schema.meta.form]: schema,
				}),
				activeSections: sections.reduce(
					(acc, curr) => ({
						...acc,
						[curr.id]: {
							model: {},
							status: "VALID",
							errors: {},
							dirty: false,
						},
					}),
					{},
				),
			}),
		);
	}

	@Action(LoadSubmissionData, { cancelUncompleted: true })
	onLoadSubmissionData(ctx: Context, {
		form,
		index,
		version
	}: LoadSubmissionData) {
		const schema = ctx.getState().schemas[form];
		return from(this.formService.findSubmissionData({
			form, index: Number(index), version
		})).pipe(
			tap((data) => {
				if (!data) return;
				const parsedData = this.parseRawData(schema, data);
				ctx.setState(
					patch({
						workingVersion: version,
						rawData: patch({
							...parsedData,
						}),
					}),
				);
				const sections = flattenSections(schema);
				for (const section of sections) {
					if (section.fields.length == 0) continue;
					const formData = section.fields.reduce(
						(acc, curr) => ({
							...acc,
							[extractFieldKey(curr.key)]: parsedData[extractFieldKey(curr.key)]
						}),
						{} as typeof parsedData,
					);

					ctx.setState(
						patch({
							activeSections: patch({
								[section.id]: patch({
									model: formData,
								}),
							}),
						}),
					);
				}
				ctx.dispatch(new UpdateRelevance(form));
				// setTimeout(() => ctx.dispatch(new UpdateValidity(form)), 0);
			}),
		);
	}

	private extractSubFormData(
		schema: Extract<FieldSchema, { type: "table" }>,
		rawData: Record<string, string | (string | null)[] | null> | null,
	) {
		if (!rawData) return [];

		const columns = entries(schema.columns)
			.reduce((acc, [_, { key, ...rest }]) => {
				acc[key] = { key, ...rest };
				return acc;
			}, {} as Record<string, ColumnDefinition>);
		const columnKeys = keys(columns);
		const transformFn = (k: string, value: unknown) => {
			const columnDefinition = columns[k];
			return parseValue(columnDefinition, value as RawValue);
		};

		const temp: Record<string, unknown[]> = {};
		for (const [k, v] of entries(rawData)) {
			if (!columnKeys.includes(k)) continue;
			temp[k] = v as unknown[];
		}

		return toRowMajor(temp, transformFn);
	}

	private parseRawData(
		formSchema: FormSchema,
		data: FindSubmissionDataResponse,
	) {
		const fields = extractAllFields(formSchema);
		const result: Record<
			string,
			| ParsedValue[]
			| ParsedValue
			| Record<string, ParsedValue[] | ParsedValue | null>[]
			| null
		> = {};
		for (const field of fields) {
			const fieldKey = extractFieldKey(field.key);
			if (field.type !== "table") {
				result[fieldKey] = parseValue(field, data?.[fieldKey] ?? null);
			} else {
				result[fieldKey] = this.extractSubFormData(field, data);
			}
		}
		return result;
	}

	@Action(RemoveMapping)
	onRemoveMapping(ctx: Context, arg: RemoveMapping) {
		return from(this.formService.removeMapping(arg)).pipe(
			tap((v) => {
				const mappings = ctx.getState().mappings;
				if (!mappings) return;
				if (!v) return;
				delete mappings[arg.form][arg.field];
				ctx.setState(
					patch({
						mappings,
					}),
				);
			}),
		);
	}

	@Action(SetFormType)
	onSetFormType(ctx: Context, { form }: SetFormType) {
		ctx.setState(
			patch({
				lastFocusedFormType: form,
			}),
		);
	}

	@Action(UpdateMappings)
	onUpdateMappings(ctx: Context, { form, mappings }: UpdateMappings) {
		return from(this.formService.updateFieldMappings(form, ...mappings)).pipe(
			tap((result) => {
				const obj = result.reduce((acc, curr) => {
					return { ...acc, [curr.field]: curr };
				}, {});
				ctx.setState(
					patch({
						mappings: patch({
							[form]: patch(obj),
						}),
					}),
				);
			}),
		);
	}

	@Action(LoadDbColumns)
	onLoadDbColumns(ctx: Context, { form }: LoadDbColumns) {
		if (ctx.getState().columns?.[form] !== undefined) {
			return EMPTY;
		}
		return from(this.formService.loadDbColumnSpecsFor(form)).pipe(
			tap((specs) =>
				ctx.setState(
					patch({
						columns: patch({
							[form]: specs,
						}),
					}),
				),
			),
		);
	}

	@Action(LoadOptions)
	onLoadOptions(ctx: Context, { form }: LoadOptions) {
		if (ctx.getState().options?.[form] !== undefined) {
			return EMPTY;
		}
		return from(this.formService.loadFormOptionsFor(form)).pipe(
			tap((options) =>
				ctx.setState(
					patch({
						options: patch({
							[form]: options,
						}),
					}),
				),
			),
		);
	}

	@Action(LoadMappings)
	onLoadMappings(ctx: Context, action: LoadMappings) {
		return from(this.formService.findFieldMappings(action)).pipe(
			tap((mappings) => {
				for (const mapping of mappings) {
					ctx.setState(
						patch({
							mappings: patch({
								[action.form]: patch({
									[mapping.field]: mapping,
								}),
							}),
						}),
					);
				}
			}),
		);
	}
}

export function provideFormStore(
	...features: EnvironmentProviders[]
): EnvironmentProviders {
	return provideStates([FormState], ...features);
}
