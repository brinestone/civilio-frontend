import { DecimalPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	inject,
	Injector,
	linkedSignal,
	model,
	resource,
	signal,
	Signal,
	untracked,
	WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormRecord, ReactiveFormsModule, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FieldMapperComponent, GeoPointComponent, TabularFieldComponent } from '@app/components';
import {
	extractAllFields,
	FieldDefinition,
	FormModelDefinition,
	HasPendingChanges,
	lookupFieldSchema,
	ParsedValue,
	parseValue,
	RawInput,
	serializeValue
} from '@app/model';
import { IsArrayPipe } from '@app/pipes';
import { FORM_SERVICE } from '@app/services/form';
import { LoadOptions, UpdateMappings } from '@app/store/form';
import { optionsSelector } from '@app/store/selectors';
import { mapSignal } from '@app/util';
import { deepTransform, FieldKey, FormType, Option, toRowMajor, UpdateSubmissionSubFormDataRequest } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideSave, lucideTrash2, lucideUnlink } from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, dispatch, ofActionSuccessful, Store } from '@ngxs/store';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { isAfter, isBefore, toDate } from 'date-fns';
import { cloneDeepWith, differenceBy, differenceWith, intersectionBy, isArray, isEmpty, isObject, isString, last } from 'lodash';
import { toast } from 'ngx-sonner';
import { createNotifier } from 'ngxtension/create-notifier';
import { derivedFrom } from 'ngxtension/derived-from';
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
import { debounceTime, filter, from, map, mergeMap, Observable, pipe } from 'rxjs';
import z from 'zod';


@Component({
	selector: 'cv-form-page',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
		provideIcons({
			lucideUnlink,
			lucideChevronLeft,
			lucideChevronRight,
			lucideSave,
			lucideTrash2
		})
	],
	imports: [
		BrnAlertDialogImports,
		HlmAlertDialogImports,
		BrnSheetImports,
		HlmSheetImports,
		HlmAutocompleteImports,
		HlmTabsImports,
		TranslatePipe,
		HlmButton,
		IsArrayPipe,
		NgTemplateOutlet,
		HlmDatePickerImports,
		HlmSelectImports,
		DecimalPipe,
		BrnSelectImports,
		FieldMapperComponent,
		HlmInput,
		NgIcon,
		TabularFieldComponent,
		HlmCheckboxImports,
		HlmLabel,
		ReactiveFormsModule,
		GeoPointComponent,
		RouterLink,
		NgStyle
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form.page.html',
	styleUrl: './form.page.scss'
})
export class FormPage implements AfterViewInit, HasPendingChanges {
	private store = inject(Store);
	private readonly translationService = inject(TranslateService);
	private navigate = dispatch(Navigate);
	protected readonly cdr = inject(ChangeDetectorRef);
	private loadOptions = dispatch(LoadOptions);
	private readonly targetTab = injectRouteFragment()
	private formService = inject(FORM_SERVICE);
	private readonly submissionIndexInput = injectParams('submissionIndex');
	protected readonly submissionIndex = linkedSignal(() => {
		const index = this.submissionIndexInput();
		return index === null ? null : Number(index);
	});
	protected readonly injector = inject(Injector);
	private routeData = injectRouteData();
	protected readonly route = inject(ActivatedRoute);
	protected readonly indexInputFilter = linkedSignal(() => String(this.submissionIndex() ?? ''));
	protected readonly debouncedIndexFilter = derivedFrom([this.indexInputFilter], pipe(
		map(([v]) => v ?? ''),
		debounceTime(500),
	), { initialValue: '' });
	protected readonly indexSuggestions = resource({
		defaultValue: [],
		params: () => ({ form: this.formType(), filter: this.debouncedIndexFilter() }),
		loader: async ({ params: { filter, form } }) => {
			if (!filter || !z.string().regex(/^\d+$/).safeParse(filter).success) return [];
			return this.formService.findIndexSuggestions(form, filter);
		}
	});

	protected readonly savingChanges = signal(false);
	protected closePendingChangesDialogHandler?: (choice: 'discard_leave' | 'cancel' | 'save_leave') => void = () => { this.pendingChangesDialogState.set('closed'); };
	protected readonly pendingChangesDialogState = signal<BrnDialogState>('closed');
	protected readonly mapperSheetState = model<BrnDialogState>('closed');
	protected readonly autoCompletionSources: Record<string, [WritableSignal<string>, Signal<string[]>]> = {};
	private readonly optionsNotifier = createNotifier();
	protected formType = computed(() => this.routeData()['form'] as FormType);
	protected formModel = computed(() => this.routeData()['model'] as FormModelDefinition);
	protected optionSelector = computed(() => optionsSelector(this.formType()));
	protected readonly allFormOptions = computed(() => {
		this.optionsNotifier.listen();
		return this.store.selectSnapshot(this.optionSelector());
	});
	protected readonly formOptions: Record<string, Signal<Option[]>> = {};
	protected relevanceRegistry: Record<string, () => boolean> = {};
	protected valueProviders: Record<string, Signal<ParsedValue | ParsedValue[] | Record<string, ParsedValue | ParsedValue[]>[]>> = {};
	private controlValidatorRegistry: Record<string, ValidatorFn[]> = {};
	protected currentTab = linkedSignal(() => {
		return this.targetTab() ?? this.formModel().sections[0].id;
	});
	protected readonly surroundingRefs = resource({
		params: () => ({
			index: this.submissionIndex(), form: this.formType()
		}),
		loader: async ({ params: { index, form } }) => {
			if (index === null) return null;
			return await this.formService.findSurroundingSubmissionRefs(form, Number(index))
		}
	});
	protected readonly submissionData = resource({
		defaultValue: {},
		params: () => ({ index: this.submissionIndex() }),
		loader: async ({ params: { index } }) => {
			if (index === null) return {};
			return await this.formService.findSubmissionData(this.formType(), index);
		}
	});
	protected readonly form = new FormRecord<UntypedFormControl>({});

	constructor(actions: Actions) {
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
				this.autoCompletionSources[schema.key] = this.setupAutocompletion(schema);
			}

			if (schema.type == 'single-selection' || schema.type == 'multi-selection') {
				const src = this.setupDropdownOptions(schema);
				if (src) {
					this.formOptions[schema.key] = src;
				}
			}
		}
	}

	private setupDropdownOptions(schema: Extract<FieldDefinition, { type: 'multi-selection' | 'single-selection' }>) {
		if (schema.parent) {
			const parentProvider = this.valueProviders[schema.parent];
			const parentNotifier = createNotifier();
			const provider = computed(() => {
				parentNotifier.listen();
				const parentValue = untracked(parentProvider) as string;
				const fieldOptions = this.allFormOptions()[schema.optionsGroupKey];
				if (!fieldOptions) return [];
				return fieldOptions.filter(({ parent }) => parent === parentValue);
			});

			effect(() => {
				const currentOptions = provider();
				if (currentOptions.every(({ value }) => value != this.form.controls[schema.key].value)) {
					this.form.controls[schema.key].setValue(null);
				}
			}, { injector: this.injector });

			effect(() => {
				const _ = parentProvider();
				parentNotifier.notify();
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
		const provider = derivedFrom([source, this.form.controls[schema.key].valueChanges], pipe(
			debounceTime(500),
			map(([v1, v2]) => String(v1 || v2).trim()),
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
			return predicate(deps as any);
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

	private extractSubFormData(schema: Extract<FieldDefinition, {
		type: 'table'
	}>, rawData: Record<string, string | (string | null)[] | null> | null) {

		if (rawData == null) return [];

		const transformFn = (k: string, value: unknown) => {
			const [lastPart] = k.split('.').slice(-1);
			const columnDefinition = schema.columns[lastPart];
			return parseValue(columnDefinition, (value as RawInput));
		}

		const temp: Record<string, unknown[]> = {};
		for (const [k, v] of Object.entries(rawData)) {
			if (!k.startsWith(schema.key)) continue;
			temp[k] = v as any;
		}

		return toRowMajor(temp, transformFn);
	}

	private makeProviderSignal(schema: FieldDefinition) {
		const { key, type } = schema;

		if (type == 'table') {
			return derivedFrom([this.form.controls[key].valueChanges, this.submissionData.value], pipe(
				map(([formValue, rawValue]) => {
					if (formValue) return formValue as Record<string, ParsedValue | ParsedValue[]>[];
					return this.extractSubFormData(schema, rawValue)
				})
			), { injector: this.injector, initialValue: [] });
		} else
			return derivedFrom([this.form.controls[key].valueChanges, this.submissionData.value], pipe(
				map(([formValue, pristineValue]) => formValue as ParsedValue | ParsedValue[] | undefined ?? parseValue(schema, pristineValue?.[key] ?? null) ?? null),
			), { injector: this.injector, initialValue: null });
	}

	private extractValidators(schema: FieldDefinition) {
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
			const dateValidationSchema = z.union([z.iso.date(), z.date()]);
			if (schema.max) {
				validators.push(c => {
					if (!c.value) return null;
					console.log(c.value);
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

		return validators;
	}

	protected addFieldControl(schema: FieldDefinition) {
		const key = schema.key;
		const control = new UntypedFormControl();
		this.form.addControl(key, control);
		this.valueProviders[key] = this.makeProviderSignal(schema);

		this.controlValidatorRegistry[key] = this.extractValidators(schema);
		control.addValidators(this.controlValidatorRegistry[key]);

		let source: Signal<any>;

		if (schema.type == 'table') {
			source = derivedFrom([this.submissionData.value], pipe(
				map(([v]) => this.extractSubFormData(schema, v))
			), { injector: this.injector, initialValue: [] })
		} else {
			source = mapSignal(
				this.submissionData.value, key,
				pipe(map(v => parseValue(schema, v as RawInput | null))),
				{ injector: this.injector });
		}

		effect(() => {
			const updatedValue = source();
			control.setValue(updatedValue);
			control.markAsPristine();
			control.markAsUntouched({ emitEvent: false });
			this.cdr.markForCheck();
		}, { injector: this.injector });
	}

	protected onActiveTabChanged(tab: string) {
		this.currentTab.set(tab);
		this.navigate([], undefined, {
			fragment: tab,
			queryParamsHandling: 'preserve',
			preserveFragment: true,
		});
	}

	private markAsPristine() {
		this.form.markAsUntouched();
		this.form.markAsPristine();
		this.form.updateValueAndValidity();
		this.cdr.markForCheck();
	}

	hasPendingChanges() {
		if (this.form.pristine) return true;
		return new Observable<boolean>(subscriber => {
			this.closePendingChangesDialogHandler = (v) => {
				this.pendingChangesDialogState.set('closed');
				subscriber.add(() => this.closePendingChangesDialogHandler = () => { this.pendingChangesDialogState.set('closed') });
				if (v == 'save_leave') {
					this.savingChanges.update(() => true);
					from(this.savePendingChanges()).subscribe({
						error: (e: Error) => {
							this.savingChanges.update(() => false);
							toast.error(this.translationService.instant('msg.error.title'), { description: e.message });
						},
						complete: () => {
							this.savingChanges.update(() => false);
							subscriber.next(true);
							this.markAsPristine();
							subscriber.complete();
						}
					});
				} else {
					if (v == 'discard_leave') {
						this.markAsPristine()
					}
					subscriber.next(v != 'cancel');
					subscriber.complete();
				}
			};
			this.pendingChangesDialogState.set('open');
		})
	}

	protected onFormSubmit(event?: SubmitEvent | null) {
		event?.preventDefault();
		this.savingChanges.update(() => true);
		const promise = this.savePendingChanges();
		toast.promise(promise, {
			loading: this.translationService.instant('msg.saving_changes.description'),
			success: () => {
				this.markAsPristine();
				return this.translationService.instant('msg.changes_saved.description')
			},
			error: (e) => {
				return (e as Error).message;
			},
			finally: () => {
				this.savingChanges.update(() => false);
			}
		});
	}

	protected onFormReset(event: Event) {
		event.preventDefault();
	}

	protected discardPendingChanges() {

	}

	protected async savePendingChanges() {
		const allControls = Object.entries(this.form.controls);
		let rootChanges: Record<string, string> = {};
		let subFormChanges: Extract<UpdateSubmissionSubFormDataRequest, { type: 'update' }>['changes'] = [];
		let subFormDeletions: Extract<UpdateSubmissionSubFormDataRequest, { type: 'delete' }>['indexes'] = [];
		let subFormAdditions: Extract<UpdateSubmissionSubFormDataRequest, { type: 'update' }>['changes'] = [];
		for (const [key, control] of allControls) {
			if (control.pristine) continue;
			const schema = lookupFieldSchema(key, this.formModel());
			if (!schema) {
				console.warn(`Schema could not be found for ${key}`);
				continue;
			}

			if (schema.type == 'table') {
				const transformFn = (key: string, value: unknown) => {
					const k = last(key.split('.')) as string;
					const columnDefinition = schema.columns[k];
					return serializeValue(columnDefinition, value);
				};

				const pristineData = this.extractSubFormData(schema, this.submissionData.value());
				subFormDeletions = deepTransform(differenceBy(pristineData, control.value, schema.identifierColumn), transformFn).map((v: any) => ({ index: Number(v[schema.identifierColumn]), identifierKey: schema.identifierColumn }));
				subFormAdditions = deepTransform(differenceBy(control.value, pristineData, schema.identifierColumn), transformFn).map((v: any) => {
					return { identifier: { value: v[schema.identifierColumn], fieldKey: schema.identifierColumn }, data: v, };
				});
				subFormChanges = deepTransform(intersectionBy(control.value, pristineData, schema.identifierColumn), transformFn).map((v: any) => {
					return { identifier: { value: v[schema.identifierColumn], fieldKey: schema.identifierColumn }, data: v };
				});
			} else
				rootChanges[key] = serializeValue(schema, control.value);
		}

		if (!isEmpty(subFormDeletions)) {
			await this.formService.updateSubFormSubmissionFormData({
				type: 'delete',
				form: this.formType(),
				indexes: subFormDeletions,
				parentIndex: this.submissionIndex() as number
			});
		}

		if (!isEmpty(subFormChanges) || !isEmpty(subFormAdditions)) {
			await this.formService.updateSubFormSubmissionFormData({
				type: 'update',
				form: this.formType(),
				changes: [...subFormChanges, ...subFormAdditions],
				parentIndex: this.submissionIndex() as number
			});
		}
		if (!isEmpty(rootChanges)) {
			await this.formService.updateSubmissionFormData({
				type: 'update',
				changes: rootChanges,
				form: this.formType(),
				index: this.submissionIndex() ?? undefined
			});
		}
	}
}
