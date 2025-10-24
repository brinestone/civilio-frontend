import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	OnInit,
	resource,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import {
	ActivatedRoute,
	NavigationEnd,
	Router,
	RouterLink,
	RouterLinkActive,
	RouterOutlet,
} from "@angular/router";
import { FormFooterComponent, FormHeaderComponent } from "@app/components/form";
import { FormSchema, HasPendingChanges } from "@app/model/form";
import { FORM_SERVICE } from "@app/services/form";
import { ActivateForm, LoadOptions, LoadSubmissionData, UpdateMappings } from "@app/store/form";
import { relevanceRegistry, sectionValidity } from "@app/store/selectors";
import { isActionLoading } from "@app/util";
import { FormType } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideCircleAlert
} from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { Navigate } from "@ngxs/router-plugin";
import { Actions, dispatch, ofActionSuccessful, select } from "@ngxs/store";
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher,
} from "@spartan-ng/brain/forms";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { last } from "lodash";
import { injectRouteData } from "ngxtension/inject-route-data";
import { concatMap, filter, map, Observable } from "rxjs";

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
		HlmBadge
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./form.page.html",
	styleUrl: "./form.page.scss",
})
export class FormPage implements AfterViewInit, HasPendingChanges, OnInit {
	readonly submissionIndex = input.required<string>();

	private routeData = injectRouteData();
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private formService = inject(FORM_SERVICE);
	private navigate = dispatch(Navigate);
	private loadOptions = dispatch(LoadOptions);
	private loadData = dispatch(LoadSubmissionData);
	private activate = dispatch(ActivateForm);


	protected readonly loadingSubmissionData = isActionLoading(LoadSubmissionData);
	protected readonly activeSection = toSignal(this.router.events.pipe(
		takeUntilDestroyed(),
		filter(ev => ev instanceof NavigationEnd),
		map(() => last(this.router.url.split('/')) as string)
	), { initialValue: last(this.router.url.split('/')) as string });
	protected relevanceRegistry = select(relevanceRegistry);
	protected sectionValidity = select(sectionValidity);
	protected formType = computed(() => this.routeData()["form"] as FormType);
	protected formModel = computed(() => this.routeData()["model"] as FormSchema);
	protected readonly neighboringRefs = resource({
		params: () => ({ index: this.submissionIndex(), form: this.formType() }),
		loader: async ({ params: { form, index } }) => {
			if (index === null) return null;
			return await this.formService.findSurroundingSubmissionRefs(form, Number(index));
		}
	});

	constructor(actions$: Actions) {
		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(UpdateMappings)
		).subscribe(() => this.loadData(this.formType(), this.submissionIndex()));
	}

	ngAfterViewInit(): void { }
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}
	ngOnInit(): void {
		this.activate(this.formModel()).pipe(
			concatMap(() => this.loadOptions(this.formType())),
			concatMap(() => this.loadData(this.formType(), this.submissionIndex()))
		).subscribe();
	}

	protected onIndexJump(index: number) {
		this.navigate(["..", index, this.activeSection()], undefined, { relativeTo: this.route });
	}
	protected onNextSubmissionRequested() {
		const index = this.neighboringRefs.value()![1] as number;
		this.navigate(['..', index, this.activeSection()], undefined, { relativeTo: this.route });
	}
	protected onPrevSubmissionRequested() {
		const index = this.neighboringRefs.value()![0] as number;
		this.navigate(['..', index, this.activeSection()], undefined, { relativeTo: this.route });
	}
}
