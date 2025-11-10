import { EnvironmentProviders, inject, Injectable } from "@angular/core";
import { ValidationErrors } from "@angular/forms";
import {
	extractAllFields, extractFieldKey,
	extractRawValidators,
	FieldSchema,
	flattenSections,
	FormSchema,
	lookupFieldSchema,
	ParsedValue,
	parseValue,
	RawValue,
	RelevanceDefinition,
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
  toRowMajor,
} from "@civilio/shared";
import {
  Action,
  provideStates,
  State,
  StateContext,
  StateToken,
} from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { keys, last, values } from "lodash";
import { EMPTY, from, tap } from "rxjs";
import { deleteByKey } from "../operators";
import {
  ActivateForm,
  ActivateSection,
  DeactivateForm,
  LoadDbColumns,
  LoadMappings,
  LoadOptions,
  LoadSubmissionData,
  RemoveMapping,
  SetFormType,
  UpdateMappings,
  UpdateRelevance,
  UpdateSection,
  UpdateSectionStatus,
  UpdateValidity,
} from "./actions";
export * from "./actions";
export type SectionForm = {
  model: Record<string, unknown>;
  dirty: boolean;
  status: "INVALID" | "VALID" | "PENDING" | "DISABLED";
  errors: Record<string, ValidationErrors | null>;
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

@Injectable()
@State({
  name: FORM_STATE,
  defaults: {
    lastFocusedFormType: "csc",
    activeSections: {},
    schemas: {},
    relevanceRegistry: {},
  },
})
class FormState {
  private readonly formService = inject(FORM_SERVICE);

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
      }),
    );
  }

  @Action(UpdateSectionStatus)
  onUpdateSectionStatus(
    ctx: Context,
    { dirty, section, status, errors }: UpdateSectionStatus,
  ) {
    ctx.setState(
      patch({
        activeSections: patch({
          [section]: patch({
            dirty,
            errors,
            status,
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
    ctx.dispatch([new UpdateRelevance(form, section)]);
  }

  @Action(ActivateForm)
  onActivateForm(ctx: Context, { schema }: ActivateForm) {
    const sections = flattenSections(schema).filter((s) => s.fields.length > 0);
    ctx.setState(
      patch({
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

  @Action(LoadSubmissionData)
  onLoadSubmissionData(ctx: Context, { form, index }: LoadSubmissionData) {
    const schema = ctx.getState().schemas[form];
    return from(this.formService.findSubmissionData(form, Number(index))).pipe(
      tap((data) => {
        if (!data) return;
        const parsedData = this.parseRawData(schema, data);
        ctx.setState(
          patch({
            rawData: patch({
              ...parsedData,
            }),
          }),
        );
        const sections = flattenSections(schema);
        for (const section of sections) {
          if (section.fields.length == 0) continue;
          const formData = section.fields.reduce(
            (acc, curr) => ({ ...acc, [extractFieldKey(curr.key)]: parsedData[extractFieldKey(curr.key)] }),
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

    const transformFn = (k: string, value: unknown) => {
      const lastPart = last(k.split(".")) as string;
      const columnDefinition = schema.columns[lastPart];
      return parseValue(columnDefinition, value as RawValue);
    };

    const temp: Record<string, unknown[]> = {};
    for (const [k, v] of Object.entries(rawData)) {
      if (!k.startsWith(extractFieldKey(schema.key))) continue;
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
      if (field.type !== "table") {
        result[extractFieldKey(field.key)] = parseValue(field, data?.[extractFieldKey(field.key)] ?? null);
      } else {
        result[extractFieldKey(field.key)] = this.extractSubFormData(field, data);
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
