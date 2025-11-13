import { NgClass, NgTemplateOutlet, SlicePipe } from "@angular/common";
import { Component, computed, effect, inject, OnDestroy, OnInit, resource, signal, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { FormFooterComponent, FormHeaderComponent } from "@app/components/form";
import { flattenSections, FormSchema, HasPendingChanges, } from "@app/model/form";
import { FORM_SERVICE } from "@app/services/form";
import { UpdateMiscConfig } from "@app/store/config";
import {
	ActivateForm,
	DeactivateForm,
	InitVersioning,
	LoadOptions,
	LoadSubmissionData,
	SubmissionIndexChanged,
	UpdateMappings,
	UpdateRelevance
} from "@app/store/form";
import { currentLocale, miscConfig, relevanceRegistry, sectionValidity } from "@app/store/selectors";
import { FindSubmissionVersionsRequestSchema, FindSubmissionVersionsResponse, FormType } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCircleAlert, lucidePanelBottomClose, lucidePanelBottomOpen } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { Navigate } from "@ngxs/router-plugin";
import { Actions, dispatch, ofActionCompleted, ofActionDispatched, ofActionSuccessful, select } from "@ngxs/store";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmToggleImports } from "@spartan-ng/helm/toggle";
import { find, intersection } from "lodash";
import { derivedFrom } from "ngxtension/derived-from";
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteData } from "ngxtension/inject-route-data";
import { concatMap, filter, map, merge, Observable, pipe, skipWhile } from "rxjs";
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { AgoDatePipePipe, MaskPipe } from '@app/pipes';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

const miscConfigKeys = {
	bottomPanelOpenState: 'form-prefs.page.bottom-panel-open'
} as const;

@Component({
	selector: "cv-form-page",
	viewProviders: [
		provideIcons({
			lucideCircleAlert,
			lucidePanelBottomOpen,
			lucidePanelBottomClose,
		}),
	],
	imports: [
		TranslatePipe,
		NgIcon,
		RouterLink,
		RouterOutlet,
		FormFooterComponent,
		FormHeaderComponent,
		HlmToggleImports,
		RouterLinkActive,
		NgClass,
		NgTemplateOutlet,
		HlmBadge,
		HlmSelectImports,
		BrnSelectImports,
		MaskPipe,
		HlmSeparatorImports,
		AgoDatePipePipe,
		SlicePipe,
		HlmSkeletonImports
	],
	// changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./form.page.html",
	styleUrl: "./form.page.scss",
})
export class FormPage
	implements HasPendingChanges, OnInit, OnDestroy {

	private readonly formService = inject(FORM_SERVICE);
	private readonly routeData = injectRouteData();
	private readonly route = inject(ActivatedRoute);
	private readonly initVersioning = dispatch(InitVersioning);
	private readonly indexChanged = dispatch(SubmissionIndexChanged);
	private readonly navigate = dispatch(Navigate);
	private readonly loadOptions = dispatch(LoadOptions);
	private readonly loadData = dispatch(LoadSubmissionData);
	private readonly activate = dispatch(ActivateForm);
	private readonly deactivate = dispatch(DeactivateForm);
	private readonly updateMisc = dispatch(UpdateMiscConfig);
	// private readonly versionParam = injectQueryParams('version', { parse: (v) => (v ?? null) as string | null });
	private initialized = false;
	private loadingData = false;

	protected locale = select(currentLocale);
	protected submissionIndex = injectParams('submissionIndex');
	protected currentVersion = resource({
		defaultValue: null,
		params: () => ({ form: this.formType(), index: this.submissionIndex() }),
		loader: async ({ params: { index, form } }) => {
			if (index === null) return null;
			const v = await this.formService.findCurrentSubmissionVersion({
				index,
				form,
			});
			return v?.version ?? null;
		}
	})
	protected bottomPanelStatus = select(miscConfig<'open' | 'closed'>(miscConfigKeys.bottomPanelOpenState));
	protected readonly loadingSubmissionData = signal(false);
	protected relevanceRegistry = select(relevanceRegistry);
	protected formModel = computed(() => this.routeData()["model"] as FormSchema);
	protected readonly activeSection = derivedFrom([this.route.firstChild!.params], pipe(
		map(([params]) => {
			return params['id'] as string;
		})
	));
	protected sectionValidity = select(sectionValidity);
	protected formType = computed(() => this.routeData()["form"] as FormType);
	protected readonly versions = resource({
		defaultValue: [],
		params: () => ({ index: this.submissionIndex(), form: this.formType() }),
		loader: async ({ params: { form, index } }) => {
			if (index == null) return [] as FindSubmissionVersionsResponse;
			return await this.formService.findSubmissionVersions(FindSubmissionVersionsRequestSchema.parse({
				form, index: index, limit: 50
			}));
		},
	})
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
		effect(() => {
			const status = this.versions.status()
			if (intersection([status], ['resolved']).length == 0 || this.versions.value().length > 0) return;
			this.initVersioning(untracked(this.submissionIndex), untracked(this.formType)).subscribe({
				complete: () => {
					this.versions.reload();
					this.currentVersion.reload();
				}
			});
		});
		effect(() => {
			const status = this.bottomPanelStatus();
			if (status) return;
			this.onBottomPanelOpenStateChanged('open');
		});

		effect(() => {
			console.debug("reloading data due to user changing version");
			this.currentVersion.value();
			if (this.loadingData) return;
			this.reloadDataOnly();
		});

		merge(
			actions$.pipe(ofActionDispatched(LoadSubmissionData), map(() => true)),
			actions$.pipe(ofActionCompleted(LoadSubmissionData), map(() => false)),
		).pipe(
			takeUntilDestroyed(),
		).subscribe((v) => this.loadingData = v);

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(UpdateRelevance),
			filter(() => !this.relevanceRegistry()[this.activeSection()]),
		).subscribe(() => {
			this.navigate(['..', this.submissionIndex(), this.formModel().sections[0].id], undefined, {
				relativeTo: this.route
			});
		});

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(UpdateMappings),
			skipWhile(() => !this.initialized)
		).subscribe(() => {
			this.reloadDataOnly();
		});

		effect(async () => {
			const index = this.submissionIndex();
			if (!this.initialized) return;
			this.reloadDataAndOptions();

			if (index === undefined) return;
			this.indexChanged(Number(index));
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

	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}

	ngOnDestroy(): void {
		this.deactivate(this.formType());
	}

	ngOnInit() {
		this.activate(this.formModel())
			.pipe(
				concatMap(() => this.loadOptions(this.formType())),
				concatMap(() =>
					this.loadData(this.formType(), this.submissionIndex()!, this.currentVersion.value() ?? undefined),
				),
			)
			.subscribe({
				error: () => {
					this.initialized = true;
				},
				complete: () => {
					this.initialized = true;
				}
			});
	}

	private reloadDataAndOptions() {
		this.loadData(this.formType(), this.submissionIndex()!, this.currentVersion.value() ?? undefined).pipe(
			concatMap(() => this.loadOptions(this.formType())),
		).subscribe();
	}

	private reloadDataOnly() {
		this.loadData(this.formType(), this.submissionIndex()!, this.currentVersion.value() ?? undefined)
			.subscribe();
	}

	protected onIndexJump(index: number) {
		this.navigate(["..", index, this.activeSection()], undefined, {
			relativeTo: this.route,
		}).subscribe(() => {
			this.reloadDataOnly();
		});
	}

	protected onNextSubmissionRequested() {
		// debugger;
		const index = this.neighboringRefs.value()![1] as number;
		const section = this.activeSection();
		this.navigate(["..", index, section ? section : this.formModel().sections[0].id], undefined, {
			relativeTo: this.route,
		}).subscribe(() => {
			this.reloadDataOnly();
		});
	}

	protected onPrevSubmissionRequested() {
		const index = this.neighboringRefs.value()![0] as number;
		const section = this.activeSection();
		this.navigate(["..", index, section ? section : this.formModel().sections[0].id], undefined, {
			relativeTo: this.route,
		}).subscribe(() => {
			this.reloadDataOnly();
		});
	}

	protected onBottomPanelOpenStateChanged(state: 'open' | 'closed') {
		this.updateMisc(miscConfigKeys.bottomPanelOpenState, state);
	}
}
