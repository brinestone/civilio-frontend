import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	inject,
	input,
	Signal
} from "@angular/core";
import {
	FormRecord,
	ReactiveFormsModule,
	UntypedFormControl,
	ValidatorFn,
} from "@angular/forms";
import { flattenSections, FormSchema, ParsedValue } from "@app/model/form";
import { ReplaceInStringPipe } from "@app/pipes";
import { rawData } from "@app/store/selectors";
import { FormSectionKey, FormType, Option } from "@civilio/shared";
import { TranslatePipe } from "@ngx-translate/core";
import { NgxsFormDirective } from "@ngxs/form-plugin";
import { Store } from "@ngxs/store";
import { injectRouteData } from "ngxtension/inject-route-data";

@Component({
	selector: "cv-section-page",
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule,
		ReplaceInStringPipe,
		NgxsFormDirective,
		TranslatePipe,
	],
	templateUrl: "./section.page.html",
	styleUrl: "./section.page.scss",
})
export class SectionPage {
	private store = inject(Store);
	private cdr = inject(ChangeDetectorRef);
	private readonly rawDataSelector = computed(() => {
		const id = this.id()!;
		return rawData(id);
	});
	protected readonly rawData = computed(() => {
		const selector = this.rawDataSelector();
		return this.store.selectSnapshot(selector);
	})

	public readonly id = input<FormSectionKey>();

	protected readonly valueProviders: Record<string, Signal<ParsedValue | ParsedValue[]>> = {};
	protected readonly controlValidatorRegistry: Record<string, ValidatorFn> = {};
	protected readonly relevanceProviders: Record<string, Signal<boolean>> = {};
	// protected readonly autoCompletionSources: Record<string, [WritableSignal]
	protected readonly formOptions: Record<string, Signal<Option[]>> = {}
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
	})
	protected readonly form = new FormRecord<UntypedFormControl>({});
}
