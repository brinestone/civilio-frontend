import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	inject,
	untracked
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	AbstractControl,
	FormArray,
	FormRecord,
	ReactiveFormsModule,
	UntypedFormArray,
	UntypedFormControl
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { TabularFieldComponent } from '@app/components';
import { FieldComponent } from "@app/components/form";
import {
	GroupFieldComponent
} from "@app/components/group-field/group-field.component";
import {
	defaultValueForType,
	extractFieldKey,
	extractValidators,
	FieldSchema,
	flattenSections,
	FormSchema,
	GroupFieldSchema
} from "@app/model/form";
import { DeltaChangeEvent } from '@app/model/form/events';
import { IsStringPipe, JoinArrayPipe } from "@app/pipes";
import {
	ActivateSection,
	DiscardChanges,
	LoadSubmissionData,
	RecordDeltaChange,
	Redo,
	SubmissionIndexChanged,
	Undo,
	UpdateFormDirty,
	UpdateRelevance,
	UpdateSection
} from "@app/store/form";
import {
	activeSections,
	optionsSelector,
	relevanceRegistry
} from "@app/store/selectors";
import { FieldKey, FormSectionKey, FormType } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import {
	Actions,
	dispatch,
	ofActionDispatched,
	ofActionSuccessful,
	select,
	Store
} from "@ngxs/store";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@spartan-ng/brain/forms";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { debounce, entries, isEqual } from "lodash";
import { injectParams } from "ngxtension/inject-params";
import { injectRouteData } from "ngxtension/inject-route-data";
import { debounceTime, filter, map, switchMap, take, tap } from "rxjs";


@Component({
	selector: "cv-section-page",
	viewProviders: [
		provideIcons({
			lucidePlus
		})
	],
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
		GroupFieldComponent,
		HlmButton,
		NgIcon
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
	protected readonly form = new FormRecord<UntypedFormControl | UntypedFormArray>({});

	protected readonly onFieldValueChanged = debounce(this.fieldChangeHandler.bind(this), 500);

	constructor(actions$: Actions, route: ActivatedRoute) {
		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(DiscardChanges),
			filter(() => !this.refreshingControls)
		).subscribe(() => {
			this.refreshFieldValues(true);
		});

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

	protected readonly onDeltaChange = debounce(this.deltaChangeHandler.bind(this), 500);

	private markControlAsPristine(control: AbstractControl) {
		control.markAsUntouched();
		control.markAsPristine();
		control.updateValueAndValidity();
	}

	protected groupDeltaChangeHandler(groupFieldKey: string, index: number, events: DeltaChangeEvent<any>[]) {
		this.store.dispatch(new RecordDeltaChange(
			...events.map((ev) => ({
				...ev,
				path: [this.sectionKey()!, groupFieldKey, index, ...ev.path]
			}))
		))
	}

	protected onGroupItemDeleted(index: number, groupFieldKey: string) {
		const oldValue = this.form.value[groupFieldKey][index];
		(this.form.controls[groupFieldKey] as FormArray).removeAt(index);
		this.fieldChangeHandler(groupFieldKey as any, this.form.value[groupFieldKey]);
		this.store.dispatch([
			new UpdateFormDirty(this.sectionKey()!, true),
			new RecordDeltaChange({
				path: [this.sectionKey()!, groupFieldKey, index],
				changeType: 'delete',
				oldValue
			})]);
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
		this.store.dispatch(new RecordDeltaChange({
			...event,
			path: [this.sectionKey()!, ...event.path]
		}));
	}

	private fieldChangeHandler(field: FieldKey, update: any) {
		this.store.dispatch([
			new UpdateSection(this.sectionKey()!, this.formType(), field, update),
			new UpdateFormDirty(this.sectionKey()!, this.form.dirty)
		]).subscribe(() => this.cdr.markForCheck());
	}

	protected onAddGroupItemButtonClicked(groupFieldKey: string, schema: GroupFieldSchema) {
		(this.form.controls[groupFieldKey] as UntypedFormArray).push(new UntypedFormControl({
			...schema.fields.reduce((acc, curr) => {
				const key = extractFieldKey(curr.key);
				acc[key] = defaultValueForType(curr.type);
				return acc;
			}, {} as Record<string, unknown>),
			[schema.identifierKey]: `new_${ Date.now() }`
		}));
		this.fieldChangeHandler(groupFieldKey as any, this.form.value[groupFieldKey]);
		// this.store.dispatch(new RecordDeltaChange({
		// }));
		this.cdr.markForCheck();
	}

	private addFieldControl(schema: FieldSchema) {
		const validators = extractValidators(schema);
		const initialValue = untracked(this.sectionData)[extractFieldKey(schema.key)];

		if (schema.type == 'group') {
			const controls = (initialValue as Record<string, unknown>[])?.map(v => new UntypedFormControl(v)) ?? [];
			const control = new FormArray<UntypedFormControl>(controls, validators);
			this.form.addControl(extractFieldKey(schema.key), control);
		} else {
			const control = new UntypedFormControl(initialValue, validators);
			this.form.addControl(extractFieldKey(schema.key), control);
		}
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

			if (control instanceof FormArray) {
				control.clear({ emitEvent: false });
				(storeValue as unknown[]).forEach(v => control.push(new UntypedFormControl(v), { emitEvent: false }));
			} else {
				control.setValue(storeValue);
			}
			this.markControlAsPristine(control);
			console.log(`Refreshed value for field: ${ key } from ${ JSON.stringify(existingValue) } to ${ JSON.stringify(storeValue) }`);
		}
		this.cdr.markForCheck();
	}
}
