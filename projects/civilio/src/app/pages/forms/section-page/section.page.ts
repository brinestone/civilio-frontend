import { DecimalPipe } from "@angular/common";
import {
	ChangeDetectorRef,
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	OnInit,
	signal,
	untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	FormRecord,
	ReactiveFormsModule,
	UntypedFormControl,
	ValidationErrors,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { FieldComponent } from "@app/components/form";
import {
	extractValidators,
	FieldSchema,
	flattenSections,
	FormSchema,
} from "@app/model/form";
import { JoinArrayPipe } from "@app/pipes";
import {
	ActivateSection,
	LoadOptions,
	LoadSubmissionData,
	UpdateRelevance,
	UpdateSection,
	UpdateSectionStatus,
} from "@app/store/form";
import {
	optionsSelector,
	rawData,
	relevanceRegistry,
	sectionValue,
} from "@app/store/selectors";
import { FormSectionKey, FormType } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import {
	Actions,
	dispatch,
	ofActionSuccessful,
	select,
	Store,
} from "@ngxs/store";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@spartan-ng/brain/forms";
import { entries, first, keys } from "lodash";
import { createNotifier } from "ngxtension/create-notifier";
import { derivedFrom } from "ngxtension/derived-from";
import { injectRouteData } from "ngxtension/inject-route-data";
import {
	debounceTime,
	distinctUntilKeyChanged,
	map,
	mergeMap,
	pipe,
	switchMap,
	tap
} from "rxjs";

const ID_CHANGED_LOCK = "id-changed";
const INPUT_CHANGE_LOCK = "change-by-user-input";
@Component({
	selector: "cv-section-page",
	providers: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
	],
	imports: [
		ReactiveFormsModule,
		FieldComponent,
		JoinArrayPipe,
		TranslatePipe,
		DecimalPipe,
	],
	templateUrl: "./section.page.html",
	styleUrl: "./section.page.scss",
})
export class SectionPage implements OnInit {
	private route = inject(ActivatedRoute);
	private store = inject(Store);
	private readonly destroyRef = inject(DestroyRef);
	private cdr = inject(ChangeDetectorRef);
	private readonly rawDataSelector = computed(() => {
		const id = this.id()!;
		return rawData(id);
	});
	private readonly formValueSelector = computed(() => {
		const id = this.id();
		return sectionValue(id);
	});
	private readonly formOptionsSelector = computed(() => {
		const form = first(this.id()?.split("."));
		if (!form) return null;
		return optionsSelector(form as FormType);
	});
	private readonly activate = dispatch(ActivateSection);
	private readonly updateSection = dispatch(UpdateSection);
	private readonly updateStatus = dispatch(UpdateSectionStatus);
	private dataNotifier = createNotifier();
	private relevanceNotifier = createNotifier();
	private idChangedNotifier = createNotifier();
	private optionsNotifier = createNotifier();
	private indexChanged = signal(false);

	protected id = derivedFrom(
		[this.route.params],
		pipe(map(([params]) => params["id"] as FormSectionKey)),
	);
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
		this.idChangedNotifier.listen();
		this.dataNotifier.listen();
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
		return this.data()["target"]["model"] as FormSchema;
	});
	protected readonly index = computed(() => {
		return this.data()["target"]["submissionIndex"];
	});
	protected readonly form = new FormRecord<UntypedFormControl>({});

	constructor(actions$: Actions, router: Router) {
		effect(() => {
			this.idChangedNotifier.listen();
			this.activate(this.id(), this.formType()).subscribe({
				complete: async () => {
					await navigator.locks.request(ID_CHANGED_LOCK, () => {
						this.clearAllControls();
						this.cdr.markForCheck();
						this.refreshControls();
					});
				},
			});
		});

		actions$
			.pipe(
				ofActionSuccessful(UpdateRelevance),
				tap(() => {
					navigator.locks.query().then(({ held }) => {
						if (held?.find((lock) => lock.name == INPUT_CHANGE_LOCK)) return;
						this.relevanceNotifier.notify();
					});
				}),
				takeUntilDestroyed(),
				debounceTime(200),
			)
			.subscribe(async () => {
				const { held } = await navigator.locks.query();
				if (held?.find((lock) => lock.name == ID_CHANGED_LOCK)) return;
				this.refreshControls();
			});

		this.form.statusChanges
			.pipe(takeUntilDestroyed(), debounceTime(200))
			.subscribe((value) => {
				const errors = entries(this.form.controls).reduce(
					(acc, [k, c]) => ({ ...acc, [k]: c.errors }),
					{} as Record<string, ValidationErrors | null>,
				);
				this.updateStatus(this.id(), value, this.form.dirty, errors);
			});

		this.route.params
			.pipe(distinctUntilKeyChanged("id"))
			.subscribe(() => this.idChangedNotifier.notify());

		// #region Action listeners
		actions$
			.pipe(takeUntilDestroyed(), ofActionSuccessful(LoadOptions))
			.subscribe(() => this.optionsNotifier.notify());

		actions$
			.pipe(takeUntilDestroyed(), ofActionSuccessful(LoadSubmissionData))
			.subscribe(() => this.dataNotifier.notify());
		// #endregion

		this.route.data
			.pipe(
				takeUntilDestroyed(),
				map((v) => v["target"]),
				distinctUntilKeyChanged("submissionIndex"),
				tap(() => this.indexChanged.set(true)),
				switchMap(() => actions$.pipe(ofActionSuccessful(UpdateRelevance))),

			)
			.subscribe({
				complete: () => {
					this.indexChanged.set(false);
				}
			});
	}

	ngOnInit(): void { }

	private addFieldControl(field: FieldSchema) {
		const initialValue =
			untracked(this.formValue)[field.key] ?? this.rawData()[field.key];
		const control = new UntypedFormControl(initialValue);
		this.form.addControl(field.key, control, { emitEvent: false });

		const validators = extractValidators(field);
		control.addValidators(validators);

		control.valueChanges
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(200))
			.subscribe(async (v) => {
				await navigator.locks.request(INPUT_CHANGE_LOCK, () => {
					this.updateSection(this.id(), this.formType(), field.key, v);
				});
			});
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
		keys(this.form.controls).forEach((k) => {
			this.form.removeControl(k, { emitEvent: false });
		});
		console.log("cleared controls from form: ", this.id());
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
