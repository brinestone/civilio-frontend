import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, untracked } from "@angular/core";
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AbstractControl, FormRecord, ReactiveFormsModule, UntypedFormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { FieldComponent } from "@app/components/form";
import { extractFieldKey, extractValidators, FieldSchema, flattenSections, FormSchema } from "@app/model/form";
import { IsStringPipe, JoinArrayPipe } from "@app/pipes";
import {
	ActivateSection,
	LoadSubmissionData,
	RecordDeltaChange,
	Redo,
	SubmissionIndexChanged,
	Undo,
	UpdateFormDirty,
	UpdateRelevance,
	UpdateSection
} from "@app/store/form";
import { activeSections, optionsSelector, relevanceRegistry } from "@app/store/selectors";
import { FieldKey, FormSectionKey, FormType } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import { Actions, dispatch, ofActionDispatched, ofActionSuccessful, select, Store } from "@ngxs/store";
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher, } from "@spartan-ng/brain/forms";
import { debounce, entries, isEqual } from "lodash";
import { injectParams } from "ngxtension/inject-params";
import { injectRouteData } from "ngxtension/inject-route-data";
import { debounceTime, filter, map, switchMap, take, tap } from "rxjs";
import { TabularFieldComponent } from '@app/components';
import { DeltaChangeEvent } from '@app/model/form/events';


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
	protected readonly form = new FormRecord<UntypedFormControl>({});

	constructor(actions$: Actions, route: ActivatedRoute) {
		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(Undo, Redo),
			filter(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshFieldValues(true);
		})
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

	protected onFieldValueChanged = debounce(this.fieldChangeHandler.bind(this), 500);
	protected readonly onDeltaChange = debounce(this.deltaChangeHandler.bind(this), 500);

	private markControlAsPristine(control: AbstractControl) {
		control.markAsUntouched();
		control.markAsPristine();
		control.updateValueAndValidity();
	}

	private addFieldControl(schema: FieldSchema) {
		const validators = extractValidators(schema);
		const initialValue = untracked(this.sectionData)[extractFieldKey(schema.key)];
		const control = new UntypedFormControl(initialValue, { validators });
		this.form.addControl(extractFieldKey(schema.key), control);
	}

	private refreshFieldValues(ignoreDirtyState = false) {
		console.log('refreshing field values');
		for (const [key, control] of entries(this.form.controls)) {
			const existingValue = control.value;
			const storeValue = untracked(this.sectionData)[key];
			const isControlDirty = control.dirty;
			const shouldUpdateControlValue = (!isEqual(existingValue, storeValue) && !isControlDirty) || this.indexChanged || ignoreDirtyState;
			if (!shouldUpdateControlValue) {
				if (isControlDirty) {
					console.log('Ignoring value update for dirty field: ', key);
				}
				continue
			}

			control.setValue(storeValue);
			this.markControlAsPristine(control);
			console.log(`Refreshed value for field: ${ key } from ${ JSON.stringify(existingValue) } to ${ JSON.stringify(storeValue) }`);
		}
		this.cdr.markForCheck();
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

	private removeNonRelevantControls() {
		const { fields } = untracked(this.sectionSchema);
		const rr = untracked(this.relevanceRegistry);

		for (const [key] of entries(this.form.controls)) {
			const isRelevant = rr[key];
			const isFieldInSection = fields.some(f => f.key == key);
			const shouldRemove = !isRelevant || !isFieldInSection;

			if (!shouldRemove) continue;
			this.form.removeControl(key);
			console.log(`Removed non-relevant field: ${ key }`);
		}
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
			console.log(`Added relevant field: ${ key }`);
		}
	}

	private deltaChangeHandler(event: DeltaChangeEvent<any>) {
		this.store.dispatch(new RecordDeltaChange({ ...event, path: [this.sectionKey()!, ...event.path] }));
	}

	private fieldChangeHandler(field: FieldKey, update: any) {
		this.store.dispatch([
			new UpdateSection(this.sectionKey()!, this.formType(), field, update),
			new UpdateFormDirty(this.sectionKey()!, this.form.dirty)
		]).subscribe(() => this.cdr.markForCheck());
	}
}
