import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, untracked } from "@angular/core";
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AbstractControl, FormRecord, ReactiveFormsModule, UntypedFormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { FieldComponent } from "@app/components/form";
import {
	extractFieldKey,
	extractFields,
	extractValidators,
	FieldSchema,
	flattenSections,
	FormSchema,
	ParsedValue
} from "@app/model/form";
import { IsStringPipe, JoinArrayPipe } from "@app/pipes";
import {
	ActivateSection,
	LoadSubmissionData,
	SubmissionIndexChanged,
	UpdateFormDirty,
	UpdateRelevance,
	UpdateSection
} from "@app/store/form";
import { activeSections, optionsSelector, relevanceRegistry } from "@app/store/selectors";
import { FieldKey, FormSectionKey, FormType } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import { Actions, dispatch, ofActionDispatched, ofActionSuccessful, select, Store } from "@ngxs/store";
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher, } from "@spartan-ng/brain/forms";
import { entries, isEqual, values } from "lodash";
import { injectParams } from "ngxtension/inject-params";
import { injectRouteData } from "ngxtension/inject-route-data";
import { debounceTime, filter, map, switchMap, take, tap } from "rxjs";
import { columns, TableDefinition, TabularFieldComponent } from '@app/components';

type TableCellValue = Extract<ParsedValue, boolean | string | null | number>;

@Component({
	selector: "cv-section-page",
	providers: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
	],
	imports: [
		ReactiveFormsModule,
		FieldComponent,
		JoinArrayPipe,
		NgTemplateOutlet,
		TranslatePipe,
		DecimalPipe,
		HlmFieldImports,
		IsStringPipe,
		TabularFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./section.page.html",
	styleUrl: "./section.page.scss",
})
export class SectionPage {
	public readonly sectionKey = injectParams<FormSectionKey>('id');

	// #region Flags
	private refreshingControls = false;
	private indexChanged = false;
	// #endregion

	private readonly activate = dispatch(ActivateSection);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly store = inject(Store);
	private readonly routeData = injectRouteData<Record<string, any>>('target');
	private readonly formType = computed(() => this.routeData()?.['form'] as FormType)
	private readonly formSchema = computed(() => this.routeData()?.['model'] as FormSchema);
	private readonly formData = select(activeSections);

	protected readonly relevanceRegistry = select(relevanceRegistry);
	protected readonly sectionSchema = computed(() => flattenSections(this.formSchema()).find(s => s.id == this.sectionKey()!)!);
	protected readonly options = select(optionsSelector(this.formType()));
	protected readonly sectionData = computed(() => this.formData()[this.sectionKey()!].model);
	protected readonly tableDefinitions = computed(() => {
		const tabularSchemas = extractFields(this.sectionSchema()).filter(s => s.type == 'table');
		const definitions: Record<string, TableDefinition<TableCellValue>> = {};
		for (const schema of tabularSchemas) {
			if (schema.type != 'table') continue;
			const key = extractFieldKey(schema.key);
			const columnDefinitions = values(schema.columns);
			definitions[key] = {
				rowActions: [],
				title: `${key}.title`,
				titleI18n: true,
				rowAddition: { maxRows: Number.MAX_SAFE_INTEGER },
				selection: true,
				editable: true,
				columns: columnDefinitions.map(c => {
					switch (c.type) {
						case "boolean":
							return columns.boolean({
								accessor: c.key,
								header: `${c.key}.title`,
								editor: {
									enable: c.editable,
								},
								headerI18n: true,
							})
						case 'number':
							return columns.number({
								accessor: c.key,
								header: `${c.key}.title`,
								headerI18n: true,
								editor: {
									enable: c.editable,
									max: c.max,
									min: c.min,
								}
							})
						default:
							return columns.text({
								accessor: c.key,
								header: `${c.key}.title`,
								headerI18n: true,
								editor: {
									enable: c.editable,
								}
							})
						case 'multi-selection':
						case 'single-selection':
							return columns.select<ParsedValue | ParsedValue[]>({
								header: `${c.key}.title`,
								headerI18n: true,
								optionsKey: '',
								accessor: c.key,
								editor: {
									enable: c.editable,
									multi: c.type == 'multi-selection',
									optionsKey: c.optionGroupKey
								}
							})
					}
				}) as any
			};
		}
		return definitions;
	})
	protected readonly form = new FormRecord<UntypedFormControl>({});

	constructor(actions$: Actions, route: ActivatedRoute) {
		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(SubmissionIndexChanged),
			tap(() => this.indexChanged = true),
			switchMap(() => actions$.pipe(
				ofActionSuccessful(UpdateRelevance),
				debounceTime(10),
				take(1),
			)),
			// d(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshFieldValues();
			this.indexChanged = false;
		});

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(ActivateSection),
			debounceTime(10),
			filter(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshControls(true);
		});

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionDispatched(UpdateSection),
			switchMap(() => actions$.pipe(
				ofActionSuccessful(UpdateRelevance),
				take(1),
			)),
			filter(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshControls();
		})

		route.params.pipe(
			takeUntilDestroyed(),
			debounceTime(0),
			map(({ id }) => id as FormSectionKey)
		).subscribe((id) => {
			this.activate(id, this.formType());
			this.cdr.markForCheck();
		});

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(LoadSubmissionData),
			filter(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshControls(true);
		});

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionDispatched(LoadSubmissionData),
			switchMap(() => actions$.pipe(
				ofActionSuccessful(UpdateRelevance),
				take(1)
			)),
			filter(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshFieldValues();
		});
	}

	private refreshFieldValues() {
		console.log('refreshing field values');
		for (const [key, control] of entries(this.form.controls)) {
			const existingValue = control.value;
			const storeValue = untracked(this.sectionData)[key];
			const isControlDirty = control.dirty;
			const shouldUpdateControlValue = (!isEqual(existingValue, storeValue) && !isControlDirty) || this.indexChanged;
			if (!shouldUpdateControlValue) {
				if (isControlDirty) {
					console.log('Ignoring value update for dirty field: ', key);
				}
				continue
			}

			control.setValue(storeValue);
			this.markControlAsPristine(control);
			console.log(`Refreshed value for field: ${key} from ${JSON.stringify(existingValue)} to ${JSON.stringify(storeValue)}`);
		}
		this.cdr.markForCheck();
	}

	private markControlAsPristine(control: AbstractControl) {
		control.markAsUntouched();
		control.markAsPristine();
		control.updateValueAndValidity();
	}

	private removeNonRelevantControls() {
		const { fields } = untracked(this.sectionSchema);
		const rr = untracked(this.relevanceRegistry);

		for (const [key] of entries(this.form.controls)) {
			const isRelevant = rr[key];
			const isFieldInSection = fields.some(f => f.key == key);
			const shouldRemove = !isRelevant || !isFieldInSection;

			if (!shouldRemove) continue;
			this.form.removeControl(key);
			console.log(`Removed non-relevant field: ${key}`);
		}
	}

	private addFieldControl(schema: FieldSchema) {
		const validators = extractValidators(schema);
		const initialValue = untracked(this.sectionData)[extractFieldKey(schema.key)];
		const control = new UntypedFormControl(initialValue, { validators });
		this.form.addControl(extractFieldKey(schema.key), control);
	}

	private addRelevantControls() {
		const { fields } = untracked(this.sectionSchema);
		const rr = untracked(this.relevanceRegistry);

		for (const { key, ...rest } of fields) {
			const isRelevant = rr[extractFieldKey(key)];
			const controlExists = this.form.contains(extractFieldKey(key));
			const shouldAdd = isRelevant && !controlExists;

			if (!shouldAdd) continue;
			this.addFieldControl({ key, ...rest });
			console.log(`Added relevant field: ${key}`);
		}
	}

	private refreshControls(markPristine = false) {
		this.refreshingControls = true;
		console.log('refreshing controls');
		this.removeNonRelevantControls();
		this.addRelevantControls();
		this.refreshingControls = false;
		if (markPristine) this.markControlAsPristine(this.form);
		this.cdr.markForCheck();
	}

	protected onFieldValueChanged(field: FieldKey, update: any) {
		this.store.dispatch([
			new UpdateSection(this.sectionKey()!, this.formType(), field, update),
			new UpdateFormDirty(this.sectionKey()!, this.form.dirty)
		]).subscribe(() => this.cdr.markForCheck());
	}
}
