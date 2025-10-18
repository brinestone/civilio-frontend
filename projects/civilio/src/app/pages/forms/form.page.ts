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
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormRecord, ReactiveFormsModule, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FieldMapperComponent, GeoPointComponent, TabularFieldComponent } from '@app/components';
import {
	extractAllFields as extractFieldSchemas,
	FieldSchema,
	flattenSections,
	FormSchema,
	HasPendingChanges,
	lookupFieldSchema,
	ParsedValue,
	parseValue,
	RawInput,
	SectionSchema,
	serializeValue
} from '@app/model/form';
import { IsArrayPipe, JoinArrayPipe } from '@app/pipes';
import { FORM_SERVICE } from '@app/services/form';
import { LoadOptions, UpdateMappings } from '@app/store/form';
import { optionsSelector } from '@app/store/selectors';
import { mapSignal } from '@app/util';
import { deepTransform, FieldKey, FormType, Option, toRowMajor, UnwrapArray, UpdateSubmissionSubFormDataRequest } from '@civilio/shared';
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
import { differenceBy, intersectionBy, isEmpty, keys, last } from 'lodash';
import { toast } from 'ngx-sonner';
import { createNotifier } from 'ngxtension/create-notifier';
import { derivedFrom } from 'ngxtension/derived-from';
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
import { combineLatest, debounceTime, filter, from, map, mergeMap, Observable, pipe } from 'rxjs';
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
		JoinArrayPipe,
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
	private readonly navigate = dispatch(Navigate);
	protected readonly cdr = inject(ChangeDetectorRef);
	private readonly loadOptions = dispatch(LoadOptions);
	private readonly targetTab = injectRouteFragment()
	private readonly formService = inject(FORM_SERVICE);
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
	protected formModel = computed(() => this.routeData()['model'] as FormSchema);
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
		).subscribe(() => {
			this.submissionData.reload();
			this.prepareFormControls(this.formModel());
			this.cdr.markForCheck();
		});
	}

	private cleanUpRegistries(...keys: string[]) {
		keys.forEach(k => {
			delete this.valueProviders[k];
			delete this.controlValidatorRegistry[k];
			// delete this.relevanceRegistry[k];
			delete this.autoCompletionSources[k];
			delete this.formOptions[k];
		})
	}

	private clearAllControls() {
		const currentValues: Record<string, any> = {};
		keys(this.form.controls).forEach(k => {
			currentValues[k] = this.form.value[k];
			this.form.removeControl(k);
		});

		this.cleanUpRegistries(...keys(currentValues));
		return currentValues;
	}

	ngAfterViewInit(): void {
		this.loadOptions(this.formType()).subscribe({
			complete: () => {
				this.optionsNotifier.notify();
			}
		});
		setTimeout(() => {
			this.prepareFormControls(this.formModel());
			this.cdr.markForCheck();
		}, 10);
	}

	private checkInitialRelevance(schema: FieldSchema) {
		if (!schema.relevance) return true;

		const { dependencies, predicate } = schema.relevance;
		const deps = dependencies.reduce((acc, curr) => {
			const currentData = this.submissionData.value();
			return {
				...acc,
				[curr]: parseValue(lookupFieldSchema(curr, this.formModel())!, currentData?.[curr] ?? null)
			}
		}, {} as Record<FieldKey, ParsedValue | ParsedValue[]>);

		return predicate(deps as any);
	}

	protected prepareFormControls(model: FormSchema) {
		this.clearAllControls();
		const schemas = extractFieldSchemas(model);
		for (const schema of schemas) {
			const isInitiallyRelevant = this.checkInitialRelevance(schema);
			if (!isInitiallyRelevant) {
				this.setupRelevanceSignalOnly(schema);
				continue;
			}
			this.addFieldControl(schema);
		}

		for (const schema of schemas) {
			if (this.form.controls[schema.key]) {
				this.setupFieldDependencies(schema);
			} else {
				this.setupFieldRelevanceWatch(schema);
			}
		}

		const sections = flattenSections(model);
		for (const section of sections) {
			if (!section.relevance)
				this.setupSectionRelevanceWatch(section);
		}

		this.cdr.markForCheck();
	}

	private removeFieldControl(schema: FieldSchema) {
		const { key } = schema;
		try {
			if (this.form.controls[key])
				this.form.removeControl(key);

			if (this.valueProviders[key])
				delete this.valueProviders[key];

			if (this.controlValidatorRegistry[key])
				delete this.controlValidatorRegistry[key];

			if (this.autoCompletionSources[key])
				delete this.autoCompletionSources[key];

			if (this.formOptions[key])
				delete this.formOptions[key];

			console.log(`Removed non-relevant control: ${key}`);
		} catch (e) {
			console.error(`Failed to remove control: ${key}: `, e)
		}
	}

	private setupFieldDependencies(schema: FieldSchema) {
		if (schema.relevance) {
			this.setupFieldRelevanceWatch(schema);
		}

		if (schema.type == 'text' && schema.autocomplete) {
			this.autoCompletionSources[schema.key] = this.createAutocompletionSource(schema);
		}

		if (schema.type == 'single-selection' || schema.type == 'multi-selection') {
			this.formOptions[schema.key] = this.createDropdownSource(schema);
		}
	}

	private createDropdownSource(schema: Extract<FieldSchema, { type: 'multi-selection' | 'single-selection' }>) {
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

	private createAutocompletionSource(schema: FieldSchema) {
		const source = signal<string>(this.form.controls[schema.key].value, {})
		const provider = derivedFrom([source, this.form.controls[schema.key].valueChanges], pipe(
			debounceTime(500),
			map(([v1, v2]) => String(v1 || v2).trim()),
			filter(v => v.length > 0),
			mergeMap(query => this.formService.findAutocompleteSuggestions(this.formType(), schema.key, query))
		), { injector: this.injector, initialValue: [] });
		return [source, provider] as [WritableSignal<string>, Signal<string[]>];
	}

	private setupRelevanceSignalOnly(schema: FieldSchema) {
		if (!schema.relevance) return;

		const { dependencies, predicate } = schema.relevance;
		const relevanceSignal = computed(() => {
			const deps = dependencies.reduce((acc, curr) => {
				return { ...acc, [curr]: this.valueProviders[curr]?.() };
			}, {} as Record<FieldKey, ParsedValue | ParsedValue[]>);
			return predicate(deps as any);
		});

		this.relevanceRegistry[schema.key] = relevanceSignal;
	}

	private setupSectionRelevanceWatch(schema: SectionSchema | UnwrapArray<SectionSchema['children']>) {
		// if (!schema.relevance) return;
		// const { dependencies, predicate } = schema.relevance;
		// const relevanceSignal = this.relevanceRegistry[schema.id] ?? computed(() => {
		// 	const deps = dependencies.reduce((acc, curr) => {
		// 		return { ...acc, [curr]: this.valueProviders[curr]?.() }
		// 	}, {} as Record<FieldKey, ParsedValue | ParsedValue[]>);
		// 	return predicate(deps as any);
		// });

		// if (!this.relevanceRegistry[schema.id])
		// 	this.relevanceRegistry[schema.id] = relevanceSignal;

		// effect(() => {
		// 	const isRelevant = relevanceSignal();
		// 	const sec
		// })
	}

	private setupFieldRelevanceWatch(schema: FieldSchema) {
		if (!schema.relevance) {
			return;
		}
		const { dependencies, predicate } = schema.relevance
		const relevanceSignal = this.relevanceRegistry[schema.key] ?? computed(() => {
			const deps = dependencies.reduce((acc, curr) => {
				return { ...acc, [curr]: this.valueProviders[curr]() };
			}, {} as Record<FieldKey, ParsedValue | ParsedValue[]>);
			return predicate(deps as any);
		});

		if (!this.relevanceRegistry[schema.key])
			this.relevanceRegistry[schema.key] = relevanceSignal;

		effect(() => {
			const isRelevant = relevanceSignal();
			const control = this.form.controls[schema.key];
			if (isRelevant && !control) {
				setTimeout(() => this.addFieldControl(schema), 0);
			} else if (!isRelevant && !!control) {
				this.removeFieldControl(schema);
			}
			setTimeout(() => this.cdr.markForCheck(), 0);
		}, { injector: this.injector });
	}

	private extractSubFormData(schema: Extract<FieldSchema, {
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

	private makeProviderSignal(schema: FieldSchema, control: UntypedFormControl) {
		const { key, type } = schema;

		if (type == 'table') {
			return derivedFrom([control.valueChanges, this.submissionData.value], pipe(
				map(([formValue, rawValue]) => {
					if (formValue) return formValue as Record<string, ParsedValue | ParsedValue[]>[];
					return this.extractSubFormData(schema, rawValue)
				})
			), { injector: this.injector, initialValue: [] });
		} else {
			const notifier = createNotifier();

			const src$ = combineLatest([
				control.valueChanges,
				toObservable(this.submissionData.value, { injector: this.injector }).pipe(
					map(v => v?.[key])
				)
			]).pipe(
				map(([formValue, pristineValue]) => formValue as ParsedValue | ParsedValue[] | undefined ?? parseValue(schema, pristineValue ?? null) ?? null),
			);

			return toSignal(src$, { initialValue: null, injector: this.injector });
		}

	}

	private extractValidators(schema: FieldSchema) {
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
					const { success, data: rawDate } = dateValidationSchema.safeParse(c.value);
					if (!success) {
						return { invalidDate: 'Invalid date value' };
					}

					const maxDate = toDate(schema.max as string | number);
					return isAfter(toDate(rawDate), maxDate) ? { maxDate } : null;
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

	private initializeFieldComponents(schema: FieldSchema, control: UntypedFormControl) {
		this.valueProviders[schema.key] = this.makeProviderSignal(schema, control);
		const validators = this.extractValidators(schema);
		control.addValidators(validators);
		this.controlValidatorRegistry[schema.key] = validators;
		this.setInitialControlValue(schema, control);
		this.setupValueUpdateEffect(schema, control);
	}

	private setupValueUpdateEffect(schema: FieldSchema, control: UntypedFormControl) {
		let source: Signal<any>;
		if (schema.type == 'table') {
			source = derivedFrom([this.submissionData.value], pipe(
				map(([v]) => this.extractSubFormData(schema, v))
			), { injector: this.injector, initialValue: [] });
		} else {
			source = mapSignal(
				this.submissionData.value, schema.key,
				pipe(map(v => parseValue(schema, v as RawInput | null))),
				{ injector: this.injector });
		}

		effect(() => {
			const updatedValue = source();
			if (JSON.stringify(control.value) !== JSON.stringify(updatedValue)) {
				control.setValue(updatedValue);
				this.markAsPristine(control);
			}
		}, { injector: this.injector });
	}

	private setInitialControlValue(schema: FieldSchema, control: UntypedFormControl) {
		try {
			const { key } = schema;
			const currentData = this.submissionData.value();
			let initialValue: any;
			if (schema.type == 'table') {
				initialValue = this.extractSubFormData(schema, currentData);
			} else {
				initialValue = parseValue(schema, currentData?.[key] ?? null);
			}

			control.setValue(initialValue, { emitEvent: false });
			this.markAsPristine(control);
		} catch (e) {
			console.error(`Failed to set initial value for control ${schema.key}:`, e);
			// Set a safe fallback value
			control.setValue(schema.type === 'table' ? [] : null, { emitEvent: false });
		}
	}

	private addFieldControl(schema: FieldSchema) {
		try {
			const key = schema.key;
			if (this.form.controls[key]) {
				console.log(`Control: ${key} already exists, skipping creation.`);
				return;
			}

			const control = new UntypedFormControl();
			this.form.addControl(key, control);

			this.initializeFieldComponents(schema, control);
		} catch (e) {
			console.error(`Failed to create control for field: ${schema.key}: `, e);
		}
	}

	protected onActiveTabChanged(tab: string) {
		this.currentTab.set(tab);
		this.navigate([], undefined, {
			fragment: tab,
			queryParamsHandling: 'preserve',
			preserveFragment: true,
		});
	}

	private markAsPristine(control: AbstractControl = this.form) {
		control.markAsUntouched();
		control.markAsPristine();
		control.updateValueAndValidity();
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
		this.submissionData.reload();
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
