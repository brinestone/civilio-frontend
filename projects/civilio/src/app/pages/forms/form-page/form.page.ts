import { NgTemplateOutlet } from "@angular/common";
import {
	AfterViewInit,
	Component,
	computed,
	effect,
	inject,
	input,
	OnDestroy,
	OnInit,
	resource,
	signal,
	untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	ActivatedRoute,
	RouterLink,
	RouterLinkActive,
	RouterOutlet
} from "@angular/router";
import { FormFooterComponent, FormHeaderComponent } from "@app/components/form";
import {
	flattenSections,
	FormSchema,
	HasPendingChanges,
} from "@app/model/form";
import { FORM_SERVICE } from "@app/services/form";
import {
	ActivateForm,
	DeactivateForm,
	LoadOptions,
	LoadSubmissionData,
	SubmissionIndexChanged,
	UpdateRelevance
} from "@app/store/form";
import { relevanceRegistry, sectionValidity } from "@app/store/selectors";
import { isLockHeld } from "@app/util";
import { FormType } from "@civilio/shared";
import { provideIcons } from "@ng-icons/core";
import { lucideCircleAlert } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { Navigate } from "@ngxs/router-plugin";
import { Actions, dispatch, ofActionSuccessful, select } from "@ngxs/store";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { find } from "lodash";
import { derivedFrom } from "ngxtension/derived-from";
import { injectRouteData } from "ngxtension/inject-route-data";
import { concatMap, filter, map, Observable, pipe } from "rxjs";

const LOADING_LOCK = "loading";

@Component({
	selector: "cv-form-page",
	viewProviders: [
		provideIcons({
			lucideCircleAlert,
		}),
	],
	imports: [
		TranslatePipe,
		RouterLink,
		RouterOutlet,
		FormFooterComponent,
		FormHeaderComponent,
		RouterLinkActive,
		NgTemplateOutlet,
		HlmBadge,
	],
	// changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./form.page.html",
	styleUrl: "./form.page.scss",
})
export class FormPage
	implements AfterViewInit, HasPendingChanges, OnInit, OnDestroy {
	readonly submissionIndex = input<string>();

	private routeData = injectRouteData();
	private route = inject(ActivatedRoute);
	private formService = inject(FORM_SERVICE);
	private navigate = dispatch(Navigate);
	private loadOptions = dispatch(LoadOptions);
	private loadData = dispatch(LoadSubmissionData);
	private activate = dispatch(ActivateForm);
	private deactivate = dispatch(DeactivateForm);

	protected readonly loadingSubmissionData = signal(false);
	// protected readonly relevantSections = computed(() => flattenSections(this.formModel()).filter(({ id }) => this.relevanceRegistry()[id]))
	protected relevanceRegistry = select(relevanceRegistry);
	protected formModel = computed(() => this.routeData()["model"] as FormSchema);
	protected readonly activeSection = derivedFrom([this.route.firstChild!.params], pipe(
		map(([params]) => {
			const id = params['id'] as string;
			return id;
		})
	));
	protected sectionValidity = select(sectionValidity);
	protected formType = computed(() => this.routeData()["form"] as FormType);
	protected readonly neighboringRefs = resource({
		params: () => ({ index: this.submissionIndex(), form: this.formType() }),
		loader: async ({ params: { form, index } }) => {
			if (index === null) return null;
			return await this.formService.findSurroundingSubmissionRefs(
				form,
				Number(index),
			);
		},
	});

	constructor(actions$: Actions) {

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(UpdateRelevance),
			filter(() => !this.relevanceRegistry()[this.activeSection()]),
		).subscribe(() => {
			this.navigate(['..', this.submissionIndex(), this.formModel().sections[0].id], undefined, {
				relativeTo: this.route
			});
		})

		effect(async () => {
			const index = this.submissionIndex();

			if (await isLockHeld(LOADING_LOCK)) return;
			this.reloadDataAndOptions();
		});
		effect(() => {
			const relevanceRegistry = untracked(this.relevanceRegistry);
			const isRelevant = relevanceRegistry[this.activeSection()];
			if (isRelevant) return;
			const formSchema = untracked(this.formModel);
			const relevantSection = find(
				flattenSections(formSchema),
				(s) => relevanceRegistry[s.id],
			);
			if (!relevantSection) return;
			this.navigate([relevantSection.id], undefined, {
				relativeTo: this.route,
			});
		});
	}

	ngAfterViewInit(): void { }
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}
	ngOnDestroy(): void {
		this.deactivate(this.formType());
	}
	async ngOnInit() {
		await navigator.locks.request(LOADING_LOCK, () => {
			this.activate(this.formModel())
				.pipe(
					concatMap(() => this.loadOptions(this.formType())),
					concatMap(() =>
						this.loadData(this.formType(), this.submissionIndex()!),
					),
				)
				.subscribe();
		});
	}

	private reloadDataAndOptions() {
		this.loadData(this.formType(), this.submissionIndex()!).pipe(
			concatMap(() => this.loadOptions(this.formType())),
		);
	}

	protected onIndexJump(index: number) {
		this.navigate(["..", index, this.activeSection()], undefined, {
			relativeTo: this.route,
		});
	}
	protected onNextSubmissionRequested() {
		// debugger;
		const index = this.neighboringRefs.value()![1] as number;
		const section = this.activeSection();
		this.navigate(["..", index, section ? section : this.formModel().sections[0].id], undefined, {
			relativeTo: this.route,
		});
	}
	protected onPrevSubmissionRequested() {
		// debugger;
		const index = this.neighboringRefs.value()![0] as number;
		const section = this.activeSection();
		this.navigate(["..", index, section ? section : this.formModel().sections[0].id], undefined, {
			relativeTo: this.route,
		});
	}
}
