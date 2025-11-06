import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	inject,
	input,
	untracked
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	AbstractControl,
	FormRecord,
	ReactiveFormsModule,
	UntypedFormControl
} from "@angular/forms";
import { FieldComponent } from "@app/components/form";
import { extractValidators, FieldSchema, flattenSections, FormSchema } from "@app/model/form";
import { JoinArrayPipe } from "@app/pipes";
import { ActivateSection, SubmissionIndexChanged, UpdateRelevance, UpdateSection } from "@app/store/form";
import { activeSections, optionsSelector, relevanceRegistry } from "@app/store/selectors";
import { FieldKey, FormSectionKey, FormType } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import { Actions, dispatch, ofActionSuccessful, select } from "@ngxs/store";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@spartan-ng/brain/forms";
import { entries } from "lodash";
import { injectRouteData } from "ngxtension/inject-route-data";
import { debounceTime, switchMap, take } from "rxjs";

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
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./section.page.html",
	styleUrl: "./section.page.scss",
})
export class SectionPage implements AfterViewInit {
	public readonly sectionKey = input<FormSectionKey>(undefined, { alias: 'id' });

	// #region Flags
	private refreshingControls = false;
	// #endregion

	private readonly activate = dispatch(ActivateSection);
	private readonly updateSection = dispatch(UpdateSection);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly routeData = injectRouteData<Record<string, any>>('target');
	private readonly formType = computed(() => this.routeData()?.['form'] as FormType)
	private readonly formSchema = computed(() => this.routeData()?.['model'] as FormSchema);
	private readonly formData = select(activeSections);

	protected readonly relevanceRegistry = select(relevanceRegistry);
	protected readonly sectionSchema = computed(() => flattenSections(this.formSchema()).find(s => s.id == this.sectionKey()!)!);
	protected readonly options = select(optionsSelector(this.formType()));
	protected readonly sectionData = computed(() => this.formData()[this.sectionKey()!].model);

	protected readonly form = new FormRecord<UntypedFormControl>({});

	constructor(actions$: Actions) {
		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(SubmissionIndexChanged),
			switchMap(() => actions$.pipe(
				ofActionSuccessful(UpdateRelevance),
				debounceTime(10),
				take(1),
			)),
		).subscribe(() => {
			this.refreshFieldValues();
		});

		effect(() => {
			this.relevanceRegistry();
			this.sectionSchema();

			this.refreshControls();
			console.log('controls refreshed')
		})

		effect(() => {
			const currentSection = this.sectionKey();
			if (!currentSection) return;
			this.activate(currentSection, this.formType());
		})
	}

	ngAfterViewInit(): void {
	}

	private refreshFieldValues() {
		console.log('refreshing field values');
		for (const [key, control] of entries(this.form.controls)) {
			const existingValue = control.value;
			const storeValue = untracked(this.sectionData)[key];
			const shouldUpdateControlValue = existingValue !== storeValue;
			if (!shouldUpdateControlValue) continue;

			control.setValue(storeValue);
			this.markControlAsPristine(control);
			console.log(`Refreshed value for field: ${key} from "${existingValue}" to "${storeValue}"`);
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

		for (const { key } of fields) {
			const isRelevant = rr[key];
			const controlExists = this.form.contains(key);
			const isFieldInSection = untracked(this.sectionSchema).fields.some(f => f.key === key);
			const shouldRemove = !isRelevant && controlExists || !isFieldInSection;

			if (!shouldRemove) continue;
			this.form.removeControl(key);
			console.log(`Removed non-relevant field: ${key}`);
		}
	}

	private addFieldControl(schema: FieldSchema) {
		const validators = extractValidators(schema);
		const initialValue = untracked(this.sectionData)[schema.key];
		const control = new UntypedFormControl(initialValue, { validators });
		this.form.addControl(schema.key, control);
	}

	private addRelevantControls() {
		const { fields } = untracked(this.sectionSchema);
		const rr = untracked(this.relevanceRegistry);

		for (const { key, ...rest } of fields) {
			const isRelevant = rr[key];
			const controlExists = this.form.contains(key);
			const shouldAdd = isRelevant && !controlExists;

			if (!shouldAdd) continue;
			this.addFieldControl({ key, ...rest });
			console.log(`Added relevant field: ${key}`);
		}
	}

	private refreshControls() {
		this.refreshingControls = true;
		console.log('refreshing controls');
		this.removeNonRelevantControls();
		this.addRelevantControls();
		this.refreshingControls = false;
		this.cdr.markForCheck();
	}

	protected onFieldValueChanged(field: FieldKey, update: any) {
		this.updateSection(this.sectionKey()!, this.formType(), field, update).subscribe({
			complete: () => this.cdr.markForCheck()
		});
	}
}
