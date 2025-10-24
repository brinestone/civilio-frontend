import { DecimalPipe } from "@angular/common";
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	inject
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	FormRecord,
	ReactiveFormsModule,
	UntypedFormControl
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { FieldComponent } from "@app/components/form";
import { extractValidators, FieldSchema, flattenSections, FormSchema } from "@app/model/form";
import { JoinArrayPipe } from "@app/pipes";
import { LoadOptions, LoadSubmissionData, UpdateRelevance } from "@app/store/form";
import { optionsSelector, rawData, relevanceRegistry, sectionValue } from "@app/store/selectors";
import { FormSectionKey, FormType } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import { NgxsFormDirective, UpdateFormValue } from "@ngxs/form-plugin";
import { Actions, ofActionSuccessful, select, Store } from "@ngxs/store";
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from "@spartan-ng/brain/forms";
import { first, keys } from "lodash";
import { createNotifier } from "ngxtension/create-notifier";
import { derivedFrom } from "ngxtension/derived-from";
import { injectRouteData } from "ngxtension/inject-route-data";
import { distinctUntilKeyChanged, filter, map, merge, pipe, tap } from "rxjs";

const ID_CHANGED_LOCK = 'id-changed';
@Component({
	selector: "cv-section-page",
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },

	],
	imports: [
		ReactiveFormsModule,
		NgxsFormDirective,
		FieldComponent,
		JoinArrayPipe,
		TranslatePipe,
		DecimalPipe
	],
	templateUrl: "./section.page.html",
	styleUrl: "./section.page.scss",
})
export class SectionPage {
	private route = inject(ActivatedRoute);
	private store = inject(Store);
	private cdr = inject(ChangeDetectorRef);
	private readonly rawDataSelector = computed(() => {
		const id = this.id()!;
		return rawData(id);
	});
	private readonly formValueSelector = computed(() => {
		const id = this.flatId();
		return sectionValue(id);
	});
	private readonly formOptionsSelector = computed(() => {
		const form = first(this.id()?.split('.'));
		if (!form) return null;
		return optionsSelector(form as FormType);
	})
	private dataNotifier = createNotifier();
	private relevanceNotifier = createNotifier();
	private idChangedNotifier = createNotifier();
	private formDataNotifier = createNotifier();
	private optionsNotifier = createNotifier();

	protected id = derivedFrom([this.route.params], pipe(
		map(([params]) => params['id'] as FormSectionKey)
	))
	protected readonly flatId = computed(() => this.id()!.replaceAll('.', '_'));
	protected readonly formPath = computed(() => `form.activeSections.${this.flatId()}`);
	protected readonly formOptions = computed(() => {
		this.optionsNotifier.listen();
		const selector = this.formOptionsSelector();
		if (!selector) return {};
		return this.store.selectSnapshot(selector);
	});
	protected readonly rawData = computed(() => {
		this.dataNotifier.listen();
		this.idChangedNotifier.listen();
		const selector = this.rawDataSelector();
		return this.store.selectSnapshot(selector);
	});
	protected readonly formValue = computed(() => {
		this.formDataNotifier.listen();
		this.idChangedNotifier.listen();
		const selector = this.formValueSelector();
		return this.store.selectSnapshot(selector);
	});
	protected readonly relevanceRegistry = select(relevanceRegistry);
	protected readonly data = injectRouteData();
	protected readonly formType = computed(() => {
		return this.data()["target"]["form"] as FormType;
	});
	protected readonly schema = computed(() => {
		const schema = this.data()["target"]["model"] as FormSchema;
		const sections = flattenSections(schema);
		return sections.find((s) => s.id == this.id());
	});
	protected readonly formSchema = computed(() => {
		return this.data()['target']['model'] as FormSchema;
	});
	protected readonly form = new FormRecord<UntypedFormControl>({});

	constructor(actions$: Actions) {
		this.route.params.pipe(
			takeUntilDestroyed(),
			distinctUntilKeyChanged('id')
		).subscribe(() => {
			this.idChangedNotifier.notify();
		});

		effect(async () => {
			this.idChangedNotifier.listen();
			await navigator.locks.request(ID_CHANGED_LOCK, () => {
				this.clearAllControls();
				this.refreshControls();
				this.cdr.markForCheck();
			});
		});

		merge(
			actions$.pipe(ofActionSuccessful(UpdateFormValue), filter(x => x.payload.path.substring(20) == this.flatId()), tap(() => this.formDataNotifier.notify())),
			actions$.pipe(ofActionSuccessful(LoadOptions), tap(() => this.optionsNotifier.notify())),
			actions$.pipe(ofActionSuccessful(LoadSubmissionData), tap(() => this.dataNotifier.notify())),
			actions$.pipe(ofActionSuccessful(UpdateRelevance), tap(() => this.relevanceNotifier.notify()))
		).pipe(
			takeUntilDestroyed(),
		).subscribe(async () => {
			const locks = await navigator.locks.query();
			if (locks.held?.find(lock => lock.name == ID_CHANGED_LOCK)) return;
			this.refreshControls();
		});
	}


	private addFieldControl(field: FieldSchema) {
		const initialValue = this.formValue()[field.key] ?? this.rawData()[field.key];
		const control = new UntypedFormControl(initialValue);
		this.form.addControl(field.key, control, { emitEvent: false });

		const validators = extractValidators(field);
		control.addValidators(validators);
	}

	private addRelevantFields() {
		const fields = this.schema()?.fields ?? [];
		for (const field of fields) {
			const isRelevant = this.relevanceRegistry()[field.key];
			const controlExists = this.form.contains(field.key);
			const shouldAddControl = !controlExists && isRelevant;
			if (!shouldAddControl) continue;
			this.addFieldControl(field);
			console.log(`Added field: ${field.key}`);
		}
	}

	private clearAllControls() {
		keys(this.form.controls).forEach(k => {
			this.form.removeControl(k, { emitEvent: false });
		});
		console.log('cleared controls from form: ', this.id());
	}

	private removeIrrelevantFields() {
		const fields = this.schema()?.fields ?? [];
		for (const field of fields) {
			const isRelevant = this.relevanceRegistry()[field.key];
			const controlExists = this.form.contains(field.key);
			const shouldRemoveControl = !isRelevant && controlExists;
			if (!shouldRemoveControl) continue;

			this.form.removeControl(field.key, { emitEvent: false });
			console.log(`Removed non-relevant field: ${field.key}`);
		}
	}

	private refreshControls() {
		this.removeIrrelevantFields();
		this.addRelevantFields();
		this.form.updateValueAndValidity();
		this.cdr.markForCheck();
	}
}
