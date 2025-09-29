import { DestroyRef, effect, Injector, ResourceRef, Signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormRecord, UntypedFormControl, ValidatorFn, Validators } from "@angular/forms";
import { FieldDefinition, FormModelDefinition, FosaFormDefinition, ValueProviderFnSchema, extractAllFields, lookupFieldSchema, parseValue } from "@app/model";
import { FieldKey, FindSubmissionDataResponse, Nullable } from "@civilio/shared";
import { formatDate, isAfter, isBefore, toDate } from "date-fns";
import { derivedFrom } from 'ngxtension/derived-from';
import { map, pipe } from "rxjs";
import z from "zod";

export abstract class AbstractForm {

  protected abstract form: FormRecord<UntypedFormControl>;
  protected abstract injector: Injector;
  protected abstract formModel: FormModelDefinition;
  protected abstract destroyRef: DestroyRef;
  protected abstract submissionData: ResourceRef<FindSubmissionDataResponse>;
  protected abstract irrelevant: Signal<FieldKey[]>;

  protected prepareFormControls() {
    const fields = extractAllFields(this.formModel);
    for (const field of fields) {
      this.addFieldControl(field);
    }
  }

  private makeProviderSignal({ key, ...rest }: FieldDefinition) {
    return derivedFrom([this.form.valueChanges, this.submissionData.value], pipe(
      map(([formValue, pristineValue]) => formValue[key] ?? pristineValue?.[key] ?? null),
      map(v => parseValue({ key, ...rest }, v)),
    ), { injector: this.injector, initialValue: null });
  }

  protected addFieldControl(schema: FieldDefinition) {
    const provider = this.makeProviderSignal(schema);
    const key = schema.key;
    const initialValue = provider();
    const control = new UntypedFormControl(initialValue);
    this.form.addControl(key, control);
    const validators: ValidatorFn[] = [];

    if ('required' in schema && !schema.relevanceFn) {
      validators.push(Validators.required);
    }

    if (schema.type == 'text') {
      if (schema.validValues) {
        validators.push(c => {
          const value = c.value;
          if (!value) return null;

          return schema.validValues?.includes(String(value).trim()) ? null : { invalidValue: `Value must be one of ${schema.validValues?.map(x => `'${x}'`).join(',')}` };
        });
      }

      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        validators.push(Validators.pattern(regex));
      }
    }

    if (schema.type == 'date') {
      if (schema.max) {
        validators.push(c => {
          if (!c.value) return null;

          const { success, data: rawDate } = z.iso.date().safeParse(c.value);
          if (!success) {
            return { date: 'Invalid date value' };
          }

          return isAfter(toDate(rawDate), toDate(schema.max as string | number)) ? { maxDate: `Value must be before ${formatDate(schema.max as string | number, 'dd/MMM/yyyy')}` } : null;
        })
      }

      if (schema.min) {
        validators.push(c => {
          if (!c.value) return null;

          const { success, data: rawDate } = z.iso.date().safeParse(c.value);
          if (!success) {
            return { date: 'Invalid date value' };
          }

          return isBefore(toDate(rawDate), toDate(schema.min as string | number)) ? { minDate: `Value must be after ${formatDate(schema.min as string | number, 'dd/MMM/yyyy')}` } : null;
        })
      }
    }

    // if (schema.type == '')

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

    const source = derivedFrom([this.submissionData.value], pipe(
      map(([v]) => parseValue(schema, v?.[schema.key] ?? null))
    ), { injector: this.injector, initialValue: null });

    effect(() => {
      const updatedValue = source();
      control.setValue(updatedValue);
      control.markAsPristine();
      control.markAsUntouched({ emitEvent: false });
    }, { injector: this.injector });
  }
}
