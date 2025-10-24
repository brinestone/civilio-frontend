import { EnvironmentProviders, inject, Injectable } from "@angular/core";
import { ValidationErrors } from "@angular/forms";
import { DefinitionLike, extractAllFields, FieldSchema, flattenSections, FormSchema, lookupFieldSchema, ParsedValue, parseValue, RawValue, RelevanceDefinition } from "@app/model/form";
import { FORM_SERVICE } from "@app/services/form";
import {
	FieldKey,
	FieldMapping,
	FindDbColumnsResponse,
	FindFormOptionsResponse,
	FindSubmissionDataResponse,
	FormSectionKey,
	FormType,
	toRowMajor,
} from "@civilio/shared";
import { UpdateFormValue } from "@ngxs/form-plugin";
import {
	Action,
	provideStates,
	State,
	StateContext,
	StateToken,
} from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { EMPTY, from, tap } from "rxjs";
import {
	ActivateForm,
	LoadDbColumns,
	LoadMappings,
	LoadOptions,
	LoadSubmissionData,
	RemoveMapping,
	SetFormType,
	UpdateMappings,
	UpdateRelevance
} from "./actions";
import { keys, last, values } from "lodash";
export * from "./actions";
export type SectionForm = {
	model: Record<string, ParsedValue | ParsedValue[]>;
	dirty: boolean;
	status: "INVALID" | "VALID";
	errors: Record<string, ValidationErrors>;
};

type FormStateModel = {
	mappings?: Record<FormType, Record<string, FieldMapping>>;
	options?: Record<FormType, FindFormOptionsResponse>;
	columns?: Record<FormType, FindDbColumnsResponse>;
	lastFocusedFormType: FormType;
	rawData?: Record<string, ParsedValue[] | ParsedValue | Record<string, ParsedValue[] | ParsedValue | null>[] | null>,
	schemas: Record<string, FormSchema>,
	activeSections: Record<string, SectionForm>;
	relevanceRegistry: Record<string, boolean>;
};
export const FORM_STATE = new StateToken<FormStateModel>("form");
type Context = StateContext<FormStateModel>;

function computeRelevance(
	rawValueSupplier: (k: string) => ParsedValue | ParsedValue[] | Record<string, ParsedValue | ParsedValue[]>[] | null,
	formValueSupplier: (k: string) => ParsedValue | ParsedValue[],
	formSchema: FormSchema,
	definition?: RelevanceDefinition
) {
	if (!definition) {
		return true;
	}

	const { dependencies, predicate } = definition;
	const deps = dependencies.reduce((acc, curr) => {
		const _schema = lookupFieldSchema(curr, formSchema);
		if (!_schema) return acc;
		const formValue = formValueSupplier(curr);
		const pristineValue = rawValueSupplier(curr);
		return { ...acc, [curr]: formValue ?? pristineValue };
	}, {} as Record<FieldKey, ParsedValue | ParsedValue[]>);

	return predicate(deps as any);
}

@Injectable()
@State({
	name: FORM_STATE,
	defaults: {
		lastFocusedFormType: "csc",
		activeSections: {},
		schemas: {},
		relevanceRegistry: {}
	},
})
class FormState {
	private readonly formService = inject(FORM_SERVICE);

	@Action(UpdateRelevance, { cancelUncompleted: true })
	onUpdateRelevance(ctx: Context, { form, field: affectedField }: UpdateRelevance) {
		const { schemas, rawData, activeSections } = ctx.getState();

		const formSchema = schemas[form];
		let fields = extractAllFields(formSchema);
		let sections = flattenSections(formSchema);
		const formValuesupplier = (k: string) => values(activeSections).find(({ model }) => keys(model).includes(k))?.model[k] ?? null;
		const rawValueSupplier = (k: string) => rawData?.[k] ?? null;

		if (affectedField) {
			fields = fields.filter(f => f.relevance && f.relevance.dependencies.includes(affectedField));
			sections = sections.filter(s => s.relevance && s.relevance.dependencies.includes(affectedField));
		}
		for (const field of fields) {
			const isRelevant = computeRelevance(
				rawValueSupplier,
				formValuesupplier,
				formSchema,
				field.relevance
			);
			ctx.setState(patch({
				relevanceRegistry: patch({
					[field.key]: isRelevant
				})
			}))
		}

		for (const section of sections) {
			const isRelevant = computeRelevance(
				rawValueSupplier,
				formValuesupplier,
				formSchema,
				section.relevance
			);
			ctx.setState(patch({
				relevanceRegistry: patch({
					[section.id]: isRelevant
				})
			}))
		}
	}

	@Action(UpdateFormValue, { cancelUncompleted: true })
	onUpdateFormValue(ctx: Context, { payload: { path, propertyPath } }: UpdateFormValue) {
		const [form] = path.substring(20).split('_', 2);
		const sectionKey = path.substring(20).replaceAll('_', '.') as FormSectionKey;
		ctx.dispatch(new UpdateRelevance(form as FormType, sectionKey, propertyPath as FieldKey | undefined));
	}

	@Action(ActivateForm)
	onActivateForm(ctx: Context, { schema }: ActivateForm) {
		ctx.setState(patch({
			schemas: patch({
				[schema.meta.form]: schema
			})
		}))
	}

	@Action(LoadSubmissionData)
	onLoadSubmissionData(ctx: Context, { form, index }: LoadSubmissionData) {
		const schema = ctx.getState().schemas[form];
		return from(this.formService.findSubmissionData(form, Number(index))).pipe(
			tap(data => {
				if (!data) return;
				ctx.setState(patch({
					rawData: patch({
						...this.parseRawData(schema, data)
					})
				}));
				ctx.dispatch(new UpdateRelevance(form));
			})
		)
	}

	private extractSubFormData(schema: Extract<FieldSchema, { type: 'table' }>, rawData: Record<string, string | (string | null)[] | null> | null) {
		if (!rawData) return [];

		const transformFn = (k: string, value: unknown) => {
			const lastPart = last(k.split('.')) as string;
			const columnDefinition = schema.columns[lastPart];
			return parseValue(columnDefinition, value as RawValue);
		}

		const temp: Record<string, unknown[]> = {};
		for (const [k, v] of Object.entries(rawData)) {
			if (!k.startsWith(schema.key)) continue;
			temp[k] = v as unknown[];
		}

		return toRowMajor(temp, transformFn);
	}

	private parseRawData(formSchema: FormSchema, data: FindSubmissionDataResponse) {
		const fields = extractAllFields(formSchema);
		const result: Record<string, ParsedValue[] | ParsedValue | Record<string, ParsedValue[] | ParsedValue | null>[] | null> = {};
		for (const field of fields) {
			if (field.type !== 'table') {
				result[field.key] = parseValue(field, data?.[field.key] ?? null);
			} else {
				result[field.key] = this.extractSubFormData(field, data);
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
	onLoadMappings(ctx: Context, { form }: LoadMappings) {
		return from(this.formService.findFieldMappings(form)).pipe(
			tap((mappings) => {
				for (const mapping of mappings) {
					ctx.setState(
						patch({
							mappings: patch({
								[form]: patch({
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
