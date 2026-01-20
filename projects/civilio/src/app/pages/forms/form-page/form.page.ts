import {
	DecimalPipe,
	NgClass,
	NgTemplateOutlet,
	SlicePipe
} from "@angular/common";
import {
	Component,
	computed,
	effect,
	inject,
	OnDestroy,
	OnInit,
	resource,
	signal,
	untracked
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
import { UpdateMiscConfig } from "@app/store/config";
import {
	ActivateForm,
	ChangesSaved,
	DeactivateForm,
	DiscardChanges,
	InitVersioning,
	LoadOptions,
	LoadSubmissionData,
	Redo,
	RevertToVersion,
	SaveChanges,
	SubmissionIndexChanged,
	Undo,
	UpdateMappings,
	UpdateRelevance
} from "@app/store/form/data";
import {
	changesPending,
	currentLocale,
	hasValidValidationCode,
	miscConfig,
	redoAvailable,
	relevanceRegistry,
	sectionValidity,
	totalErrorCount,
	undoAvailable
} from "@app/store/selectors";
import {
	FindSubmissionVersionsRequestSchema,
	FindSubmissionVersionsResponse,
	FormType
} from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideChevronLeft,
	lucideCircleAlert,
	lucideHistory,
	lucideLoader,
	lucidePanelBottomClose,
	lucidePanelBottomOpen,
	lucideSave,
	lucideTrash2,
	lucideX
} from "@ng-icons/lucide";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { Navigate } from "@ngxs/router-plugin";
import {
	Actions,
	dispatch,
	ofActionCompleted,
	ofActionDispatched,
	ofActionSuccessful,
	select
} from "@ngxs/store";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmToggleImports } from "@spartan-ng/helm/toggle";
import { find, intersection } from "lodash";
import { derivedFrom } from "ngxtension/derived-from";
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteData } from "ngxtension/inject-route-data";
import {
	concatMap,
	filter,
	map,
	merge,
	Observable,
	pipe,
	skipWhile
} from "rxjs";
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { AgoDatePipe, MaskPipe } from '@app/pipes';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

const miscConfigKeys = {
	bottomPanelOpenState: 'form-prefs.page.bottom-panel-open'
} as const;

@Component({
	selector: "cv-form-page",
	viewProviders: [
		provideIcons({
			lucideLoader,
			lucideCircleAlert,
			lucidePanelBottomOpen,
			lucidePanelBottomClose,
			lucideSave,
			lucideTrash2,
			lucideHistory,
			lucideChevronLeft,
			lucideX
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
		FormsModule,
		HlmSeparatorImports,
		AgoDatePipe,
		SlicePipe,
		HlmSkeletonImports,
		HlmButton,
		HlmAlertDialogImports,
		BrnAlertDialogImports,
		DecimalPipe,
		HlmTextarea,
		HlmAlertImports
	],
	// changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./form.page.html",
	styleUrl: "./form.page.scss",
})
export class FormPage
	implements HasPendingChanges, OnInit, OnDestroy {

	protected pendingChangesActionCallback?: (options: {
		type: 'close' | 'save' | 'discard',
		close: () => void
	}) => void;
	protected selectedVersion = resource({
		defaultValue: null,
		params: () => ({
			form: this.formType(),
			index: this.submissionIndex(),
			isNew: this.isNewSubmission(),
			inputVersion: this.inputVersion()
		}),
		loader: async ({ params: { isNew, index, form, inputVersion } }) => {
			if (isNew || index === null) return null;
			if (inputVersion) {
				const versionExists = await this.formService.versionExists({
					form, index: index, version: inputVersion
				});
				if (versionExists)
					return inputVersion;
			}
			const v = await this.formService.findCurrentSubmissionVersion({
				index,
				form,
			});
			return v?.version ?? null;
		}
	});
	private readonly formService = inject(FORM_SERVICE);
	private readonly routeData = injectRouteData();
	protected readonly route = inject(ActivatedRoute);
	private readonly doRevert = dispatch(RevertToVersion);
	private readonly initVersioning = dispatch(InitVersioning);
	private readonly indexChanged = dispatch(SubmissionIndexChanged);
	private readonly navigate = dispatch(Navigate);
	private readonly loadOptions = dispatch(LoadOptions);
	protected readonly validationCodeValid = select(hasValidValidationCode);
	private readonly loadData = dispatch(LoadSubmissionData);
	private readonly activate = dispatch(ActivateForm);
	private readonly deactivate = dispatch(DeactivateForm);
	private readonly updateMisc = dispatch(UpdateMiscConfig);
	private initialized = false;
	private loadingData = false;
	private readonly updateRelevance = dispatch(UpdateRelevance);
	protected readonly changeNotes = signal<string>('');
	protected readonly customVersion = signal<string>('');
	protected readonly savingChanges = signal(false);
	protected readonly totalErrors = select(totalErrorCount);
	protected readonly changeNotesValid = computed(() => this.changeNotes().trim().length > 0);
	protected readonly undo = dispatch(Undo);
	protected readonly redo = dispatch(Redo);
	protected readonly canUndo = select(undoAvailable);
	protected readonly canRedo = select(redoAvailable);
	protected hasUnsavedChanges = select(changesPending);
	protected locale = select(currentLocale);
	protected submissionIndex = injectParams('submissionIndex');
	protected inputVersion = injectQueryParams('version')
	protected isNewSubmission = computed(() => !this.submissionIndex() || this.submissionIndex() == 'new');
	protected readonly versions = resource({
		defaultValue: [],
		params: () => ({
			isNew: this.isNewSubmission(),
			index: this.submissionIndex(),
			form: this.formType()
		}),
		loader: async ({ params: { form, index, isNew } }) => {
			if (isNew || index == null) return [] as FindSubmissionVersionsResponse;
			return await this.formService.findSubmissionVersions(FindSubmissionVersionsRequestSchema.parse({
				form, index: index, limit: 50
			}));
		},
	});
	protected readonly neighboringRefs = resource({
		params: () => ({
			isNew: this.isNewSubmission(),
			index: this.submissionIndex(),
			form: this.formType()
		}),
		loader: async ({ params: { isNew, form, index } }) => {
			if (isNew || index === null) return null;
			return await this.formService.findSurroundingSubmissionRefs({
				form, index
			});
		},
	});
	protected readonly pendingChangesDialogState = signal<BrnDialogState>('closed')
	protected readonly submitChangesDialogState = signal<BrnDialogState>('closed');
	protected readonly revertDialogState = signal<BrnDialogState>('closed');
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
	private readonly ts = inject(TranslateService);
	protected readonly isSelectedVersionCurrent = computed(() => {
		const versions = this.versions.value();
		const selectedVersion = this.selectedVersion.value();
		const currentVersion = versions.find(v => v.is_current);
		return currentVersion ? currentVersion.version == selectedVersion : false;
	})
	private readonly saveChanges = dispatch(SaveChanges);
	private readonly discardChanges = dispatch(DiscardChanges);

	constructor(actions$: Actions) {
		actions$.pipe(
			ofActionDispatched(ChangesSaved)
		).subscribe(({ isNew, index }) => {
			if (isNew) {
				this.navigate(['..', index], undefined, {
					queryParamsHandling: 'preserve',
					relativeTo: this.route
				})
			} else {
				this.selectedVersion.reload();
				this.versions.reload();
			}
		})
		effect(() => {
			if (this.isNewSubmission()) return;
			const status = this.versions.status()
			if (intersection([status], ['resolved']).length == 0 || this.versions.value().length > 0) return;
			this.initVersioning(untracked(this.submissionIndex), untracked(this.formType)).subscribe({
				complete: () => {
					this.versions.reload();
					this.selectedVersion.reload();
					this.formService.findCurrentSubmissionVersion({
						form: untracked(this.formType),
						index: untracked(this.submissionIndex)
					}).then(r => this.loadData(untracked(this.formType), untracked(this.submissionIndex)!, r!.version))
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
			const version = this.selectedVersion.value();
			if (this.loadingData || !version || this.isNewSubmission()) return;
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
			this.navigate([
				'..',
				this.submissionIndex(),
				this.formModel().sections[0].id],
				undefined, {
				relativeTo: this.route
			});
		});

		actions$.pipe(
			takeUntilDestroyed(),
			ofActionSuccessful(UpdateMappings),
			skipWhile(() => !this.initialized || !this.selectedVersion.hasValue()),
			filter(() => !this.isNewSubmission())
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
		if (!this.hasUnsavedChanges()) return false;
		this.pendingChangesDialogState.set('open');
		return new Observable<boolean>(observer => {
			this.pendingChangesActionCallback = ({ type, close }) => {
				observer.add(() => {
					close();
					this.changeNotes.set('');
					this.pendingChangesActionCallback = undefined;
					this.pendingChangesDialogState.set('closed');
				});
				if (type == 'close') {
					observer.next(true);
					observer.complete();
				} else if (type == 'discard') {
					this.discardChanges(this.formType()).subscribe({
						error: (e: Error) => {
							toast.error(this.ts.instant('msg.error.title'), { description: e.message })
							observer.next(true);
							observer.complete();
						},
						complete: () => {
							observer.next(false);
							observer.complete();
						}
					})
				} else {
					this.savingChanges.set(true);
					this.saveChanges(this.formType(), this.changeNotes(), this.submissionIndex() ?? undefined, this.customVersion() || undefined).subscribe({
						error: (e: Error) => {
							this.savingChanges.set(false);
							toast.error(this.ts.instant('msg.error.title'), { description: e.message })
							observer.next(true);
							observer.complete();
						},
						complete: () => {
							this.savingChanges.set(false);
							toast.success(this.ts.instant('msg.changes_saved.title'), { description: this.ts.instant('msg.changes_saved.description') })
							observer.next(false);
							this.discardChanges(this.formType()).subscribe({
								complete: () => {
									observer.complete();
								}
							})
						}
					})
				}
			};
		});
	}


	ngOnDestroy(): void {
		this.deactivate(this.formType());
	}

	ngOnInit() {
		this.activate(this.formModel())
			.pipe(
				concatMap(() => this.loadOptions(this.formType())),
				map(() => this.selectedVersion.value()),
				// filter((version) => !!version && !this.isNewSubmission()),
				concatMap((version) => {
					if (!untracked(this.isNewSubmission))
						return this.loadData(this.formType(), this.submissionIndex()!, version ?? undefined);
					return this.updateRelevance(untracked(this.formType));
				}
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
		const version = untracked(this.selectedVersion.value) ?? undefined;
		this.loadData(this.formType(), this.submissionIndex()!, version).pipe(
			concatMap(() => this.loadOptions(this.formType())),
		).subscribe();
	}

	private reloadDataOnly() {
		const version = untracked(this.selectedVersion.value) ?? undefined;
		this.loadData(this.formType(), this.submissionIndex()!, version)
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
		const index = this.neighboringRefs.value()![1] as number;
		const section = this.activeSection();
		this.navigate(["..", index, section ? section : this.formModel().sections[0].id], undefined, {
			relativeTo: this.route,
		}).subscribe({
			complete: () => {
				if (!this.hasPendingChanges())
					this.reloadDataOnly();
			}
		});
	}

	protected onPrevSubmissionRequested() {
		const index = this.neighboringRefs.value()![0] as number;
		const section = this.activeSection();
		this.navigate(["..", index, section ? section : this.formModel().sections[0].id], undefined, {
			relativeTo: this.route,
		}).subscribe({
			complete: () => {
				if (!this.hasPendingChanges())
					this.reloadDataOnly();
			}
		});
	}

	protected onBottomPanelOpenStateChanged(state: 'open' | 'closed') {
		this.updateMisc(miscConfigKeys.bottomPanelOpenState, state);
	}

	protected onSaveChangesButtonClicked() {
		this.submitChangesDialogState.set('open');
	}

	protected onFinishButtonClicked(callback: () => void) {
		this.savingChanges.set(true);
		const toastId = toast.loading(this.ts.instant('msg.saving_changes.description'));
		const index = this.submissionIndex() == 'new' ? undefined : this.submissionIndex()!;
		this.saveChanges(this.formType(), this.changeNotes(), index, this.customVersion() || undefined).subscribe({
			error: (e: Error) => {
				this.savingChanges.set(false);
				callback();
				this.submitChangesDialogState.set('closed');
				toast.dismiss(toastId);
				toast.error(this.ts.instant('msg.error.title'), { description: e.message });
			},
			complete: () => {
				this.savingChanges.set(false);
				callback();
				this.submitChangesDialogState.set('closed');
				this.changeNotes.set('');
				toast.dismiss(toastId);
				toast.success(this.ts.instant('msg.changes_saved.title'), { description: this.ts.instant('msg.changes_saved.description') })
				this.discardChanges(this.formType()).subscribe({
					complete: () => {
						this.selectedVersion.reload();
						this.versions.reload();
					}
				})
			}
		})
	}

	protected onDiscardButtonClicked() {
		this.discardChanges(this.formType());
	}

	protected finishRevertButtonClicked() {
		this.savingChanges.set(true);
		this.doRevert(
			this.formType(),
			this.changeNotes(),
			this.submissionIndex() ?? undefined,
			this.customVersion() || undefined
		).subscribe({
			complete: () => {
				this.savingChanges.set(false);
				this.selectedVersion.reload();
				this.versions.reload();
				this.changeNotes.set('');
				this.revertDialogState.set('closed');
				toast.success(this.ts.instant('msg.changes_saved.title'), { description: this.ts.instant('msg.revert_success.description') });
			},
			error: (e: Error) => {
				this.savingChanges.set(false);
				toast.error(this.ts.instant('msg.error.title'), { description: e.message });
			}
		})
	}

	protected onSaveChangesDialogToggled(event: BrnDialogState) {
		this.submitChangesDialogState.set(event);
		if (event == 'closed') {
			this.changeNotes.set('');
			this.customVersion.set('');
		}
	}

	protected onRevertDialogToggled(value: BrnDialogState) {
		this.revertDialogState.set(value);
		if (value == 'closed') {
			this.changeNotes.set('');
			this.customVersion.set('');
		}
	}
}
