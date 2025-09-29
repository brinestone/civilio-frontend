import { ChangeDetectorRef, computed, DestroyRef, effect, Injector, ResourceRef, Signal } from "@angular/core";
import { FormRecord, UntypedFormControl, ValidatorFn, Validators } from "@angular/forms";
import { extractAllFields, FieldDefinition, FormModelDefinition, ParsedValue, parseValue, RawInput } from "@app/model";
import { mapSignal } from "@app/util";
import { FieldKey, FindSubmissionDataResponse } from "@civilio/shared";
import { isAfter, isBefore, toDate } from "date-fns";
import { derivedFrom } from 'ngxtension/derived-from';
import { map, pipe } from "rxjs";
import z from "zod";

export abstract class AbstractForm {
  protected abstract form: FormRecord<UntypedFormControl>;
  protected abstract injector: Injector;
  protected abstract formModel: FormModelDefinition;
  protected abstract destroyRef: DestroyRef;
  protected abstract submissionData: ResourceRef<FindSubmissionDataResponse>;
  protected relevanceRegistry: Record<string, () => boolean> = {};
  protected valueProviders: Record<string, Signal<ParsedValue | ParsedValue[]>> = {};
  private controlValidatorRegistry: Record<string, ValidatorFn[]> = {};
  protected abstract cdr: ChangeDetectorRef;

  protected flattenErrorMessages() {

  }

  protected prepareFormControls() {
    const fields = extractAllFields(this.formModel);
    for (const field of fields) {
      this.addFieldControl(field);
    }
    for (const field of fields) {
      this.setupRelevanceWatch(field);
    }
  }

  private setupRelevanceWatch(schema: FieldDefinition) {
    if (!schema.relevance) {
      this.relevanceRegistry[schema.key] = () => true;
      return;
    }
    const { dependencies, predicate } = schema.relevance
    const relevanceSignal = computed(() => {
      const deps = dependencies.reduce((acc, curr) => {
        return { ...acc, [curr]: this.valueProviders[curr]() };
      }, {} as Record<FieldKey, ParsedValue | ParsedValue[]>);
      const result =
        predicate(deps as any);
      return result;
    });

    this.relevanceRegistry[schema.key] = relevanceSignal;
    effect(() => {
      const isRelevant = relevanceSignal();
      const control = this.form.controls[schema.key];
      if (isRelevant) {
        const validators = this.controlValidatorRegistry[schema.key];
        if (validators) control?.setValidators(validators);
      } else {
        control?.clearValidators();
        control?.clearAsyncValidators();
      }
      setTimeout(() => this.cdr.markForCheck(), 0);
    }, { injector: this.injector });
  }

  private makeProviderSignal({ key, ...rest }: FieldDefinition) {
    return derivedFrom([this.form.valueChanges, this.submissionData.value], pipe(
      map(([formValue, pristineValue]) => formValue[key] as ParsedValue | ParsedValue[] | undefined ?? parseValue({ key, ...rest }, pristineValue?.[key] ?? null) ?? null),
    ), { injector: this.injector, initialValue: null });
  }

  protected addFieldControl(schema: FieldDefinition) {
    const provider = this.makeProviderSignal(schema);
    const key = schema.key;
    this.valueProviders[key] = provider;
    const initialValue = provider();
    const control = new UntypedFormControl(initialValue);
    this.form.addControl(key, control);
    const validators: ValidatorFn[] = [];

    if ('required' in schema && !schema.relevance) {
      validators.push(Validators.required);
    }

    if (schema.type == 'text') {
      if (schema.validValues) {
        validators.push(c => {
          const value = c.value;
          if (!value) return null;

          return schema.validValues?.includes(String(value).trim()) ? null : {
            invalidValue: {
              validValues: schema.validValues,
            }
          };
        });
      }

      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        validators.push(Validators.pattern(regex));
      }
    }

    if (schema.type == 'date') {
      const dateValidationSchema = z.iso.date();
      if (schema.max) {
        validators.push(c => {
          if (!c.value) return null;
          const { success, data: rawDate } = dateValidationSchema.safeParse(c.value);
          if (!success) {
            return { invalidDate: 'Invalid date value' };
          }

          const maxDate = toDate(schema.max as string | number);
          return isAfter(toDate(rawDate), maxDate) ? { maxDate: maxDate } : null;
        })
      }

      if (schema.min) {
        validators.push(c => {
          if (!c.value) return null;

          const { success, data: rawDate } = dateValidationSchema.safeParse(c.value);
          if (!success) {
            return { date: 'Invalid date value' };
          }

          const minDate = toDate(schema.min as string | number);
          return isBefore(toDate(rawDate), minDate) ? { minDate } : null;
        })
      }
    }

    if (schema.type == 'int' || schema.type == 'float') {
      if (schema.min) {
        validators.push(Validators.min(schema.min));
      }

      if (schema.max) {
        validators.push(Validators.max(schema.max));
      }
    }
    if (schema.validate) {
      validators.push(c => {
        const stringValue = z.string().nullable().optional().parse(c.value);
        if (!stringValue) {
          return null;
        }

        const msg = schema.validate!(stringValue);
        return msg ? { predicateFailed: msg } : null;
      });
    }

    this.controlValidatorRegistry[key] = validators;
    control.addValidators(validators);

    const source = mapSignal(
      this.submissionData.value, key,
      pipe(map(v => parseValue(schema, v as RawInput | null))),
      { injector: this.injector });

    effect(() => {
      const updatedValue = source();
      control.setValue(updatedValue);
      control.markAsPristine();
      control.markAsUntouched({ emitEvent: false });
      this.cdr.markForCheck();
    }, { injector: this.injector });
  }
}
