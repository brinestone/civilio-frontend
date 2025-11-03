import { DecimalPipe, JsonPipe, NgTemplateOutlet } from "@angular/common";
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
import {
	FormRecord,
	ReactiveFormsModule,
	UntypedFormControl
} from "@angular/forms";
import { FieldComponent } from "@app/components/form";
import { extractValidators, FieldSchema, flattenSections, FormSchema } from "@app/model/form";
import { JoinArrayPipe } from "@app/pipes";
import { ActivateSection } from "@app/store/form";
import { activeSections, optionsSelector, relevanceRegistry } from "@app/store/selectors";
import {  FormSectionKey, FormType } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import { dispatch, select } from "@ngxs/store";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@spartan-ng/brain/forms";
import { injectRouteData } from "ngxtension/inject-route-data";

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
		JsonPipe,
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

	constructor() {
		effect(() => {
			this.relevanceRegistry();
			this.sectionSchema();

			this.refreshControls();
		})
	}

	ngAfterViewInit(): void {
		this.activate(this.sectionKey()!, this.formType());
	}

	private removeNonRelevantControls() {
		const { fields } = untracked(this.sectionSchema);
		const rr = untracked(this.relevanceRegistry);

		for (const { key } of fields) {
			const isRelevant = rr[key];
			const controlExists = this.form.contains(key);
			const shouldRemove = !isRelevant && controlExists;

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

	protected onFieldValueChanged(update: any) {

	}
}
