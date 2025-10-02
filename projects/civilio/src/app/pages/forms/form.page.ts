import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, effect, inject, Injector, linkedSignal, model, resource, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormRecord, ReactiveFormsModule, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { extractAllFields, FieldDefinition, FormModelDefinition, ParsedValue, parseValue, RawInput } from '@app/model';
import { FORM_SERVICE } from '@app/services/form';
import { LoadOptions, UpdateMappings } from '@app/store/form';
import { optionsSelector } from '@app/store/selectors';
import { mapSignal } from '@app/util';
import { FieldKey, FormType, Option } from '@civilio/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { Actions, dispatch, ofActionSuccessful, Store } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { isAfter, isBefore, toDate } from 'date-fns';
import { toast } from 'ngx-sonner';
import { createNotifier } from 'ngxtension/create-notifier';
import { derivedFrom } from 'ngxtension/derived-from';
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
import { debounceTime, filter, map, mergeMap, pipe } from 'rxjs';
import z from 'zod';
import { GeoPointComponent } from "@app/components/geo-point/geo-point.component";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUnlink } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { FieldMapperComponent } from '@app/components';
import { BrnDialogState } from '@spartan-ng/brain/dialog';

@Component({
  selector: 'cv-form-page',
  viewProviders: [
    provideIcons({
      lucideUnlink
    })
  ],
  imports: [
    BrnSheetImports,
    HlmSheetImports,
    HlmAutocompleteImports,
    HlmTabsImports,
    TranslatePipe,
    HlmButton,
    NgTemplateOutlet,
    HlmDatePickerImports,
    HlmSelectImports,
    DecimalPipe,
    BrnSelectImports,
    FieldMapperComponent,
    HlmInput,
    NgIcon,
    HlmCheckboxImports,
    HlmLabel,
    ReactiveFormsModule,
    BrnTabsImports,
    GeoPointComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form.page.html',
  styleUrl: './form.page.scss'
})
export class FormPage implements AfterViewInit {
  private store = inject(Store);
  protected readonly cdr = inject(ChangeDetectorRef);
  private loadOptions = dispatch(LoadOptions);
  private readonly targetTab = injectRouteFragment()
  private formService = inject(FORM_SERVICE);
  protected readonly submissionIndex = injectParams('submissionIndex');
  protected readonly injector = inject(Injector);
  protected destroyRef = inject(DestroyRef);
  private routeData = injectRouteData();


  protected readonly mapperSheetState = model<BrnDialogState>('closed');
  protected readonly autoCompletionSources: Record<string, [WritableSignal<string>, Signal<string[]>]> = {};
  private readonly optionsNotifier = createNotifier();
  protected formType = computed(() => this.routeData()['form'] as FormType);
  protected formModel = computed(() => this.routeData()['model'] as FormModelDefinition);
  protected optionSelector = computed(() => optionsSelector(this.formType()));
  private readonly allFormOptions = computed(() => {
    this.optionsNotifier.listen();
    return this.store.selectSnapshot(this.optionSelector());
  })
  protected readonly formOptions: Record<string, Signal<Option[]>> = {};
  protected relevanceRegistry: Record<string, () => boolean> = {};
  protected valueProviders: Record<string, Signal<ParsedValue | ParsedValue[]>> = {};
  private controlValidatorRegistry: Record<string, ValidatorFn[]> = {};
  protected currentTab = linkedSignal(() => {
    return this.targetTab() ?? this.formModel().sections[0].id;
  })
  protected readonly submissionData = resource({
    defaultValue: {},
    params: () => ({ index: this.submissionIndex() }),
    loader: async ({ params: { index } }) => {
      if (index === null) return {};
      return await this.formService.findSubmissionData(this.formType(), Number(index));
    }
  });
  protected readonly form = new FormRecord<UntypedFormControl>({});

  constructor(actions: Actions) {
    effect(() => {
      console.log('submission index: ', this.submissionIndex())
    })
    effect(() => {
      const err = this.submissionData.error();
      if (!err) return;
      const { message } = err;
      toast.error('Could not retrieve submission data', { description: message })
    });

    actions.pipe(
      takeUntilDestroyed(),
      ofActionSuccessful(UpdateMappings)
    ).subscribe(() => this.submissionData.reload());
  }

  ngAfterViewInit(): void {
    this.loadOptions(this.formType()).subscribe({
      complete: () => {
        this.optionsNotifier.notify();
      }
    });
    setTimeout(() => {
      this.prepareFormControls();
      this.cdr.markForCheck();
    }, 10);
  }

  protected prepareFormControls() {
    const schemas = extractAllFields(this.formModel());
    for (const schema of schemas) {
      this.addFieldControl(schema);
    }
    for (const schema of schemas) {
      if (schema.relevance) {
        this.setupRelevanceWatch(schema);
      }
      if (schema.type == 'text' && schema.autocomplete) {
        const result = this.setupAutocompletion(schema);
        this.autoCompletionSources[schema.key] = result;
      }

      if (schema.type == 'single-selection' || schema.type == 'multi-selection') {
        const src = this.setupDropdownOptions(schema);
        if (src) {
          this.formOptions[schema.key] = src;
        }
      }
    }
  }

  private setupDropdownOptions(schema: FieldDefinition) {
    if (schema.type != 'single-selection' && schema.type != 'multi-selection') return;
    if (schema.parent) {
      const parentProvider = this.valueProviders[schema.parent];
      const provider = computed(() => {
        const parentValue = parentProvider() as string;
        const fieldOptions = this.allFormOptions()[schema.optionsGroupKey];
        if (!fieldOptions) return [];
        const result = fieldOptions.filter(({ parent }) => parent === parentValue);
        return result;
      });

      effect(() => {
        const currentOptions = provider();
        if (currentOptions.every(({ value }) => value != this.form.controls[schema.key].value)) {
          this.form.controls[schema.key].setValue(null);
        }
      }, { injector: this.injector });

      return provider;
    } else {
      return computed(() => {
        const fieldOptions = this.allFormOptions()[schema.optionsGroupKey];
        return fieldOptions ?? [];
      })
    }
  }

  private setupAutocompletion(schema: FieldDefinition) {
    const source = signal<string>(this.form.controls[schema.key].value, {})
    const provider = derivedFrom([source], pipe(
      debounceTime(500),
      filter(([v]) => !!v),
      map(v => String(v[0]).trim()),
      filter(v => v.length > 0),
      mergeMap(query => this.formService.findAutocompleteSuggestions(this.formType(), schema.key, query))
    ), { injector: this.injector, initialValue: [] });
    return [source, provider] as [WritableSignal<string>, Signal<string[]>];
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
    return derivedFrom([this.form.controls[key].valueChanges, this.submissionData.value], pipe(
      map(([formValue, pristineValue]) => formValue as ParsedValue | ParsedValue[] | undefined ?? parseValue({ key, ...rest }, pristineValue?.[key] ?? null) ?? null),
    ), { injector: this.injector, initialValue: null });
  }

  protected addFieldControl(schema: FieldDefinition) {
    const key = schema.key;
    const control = new UntypedFormControl();
    this.form.addControl(key, control);
    const provider = this.makeProviderSignal(schema);
    this.valueProviders[key] = provider;
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
      if (schema.type == 'int') {
        validators.push(control => {
          if (!control.value) return null;
          const stringValue = String(control.value ?? '').trim();

          if (!stringValue) return null;
          return z.coerce.number().int().safeParse(stringValue).success ? null : { int: true };
        })
      }
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
