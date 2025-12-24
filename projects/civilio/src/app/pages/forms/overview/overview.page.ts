import { NumberInput } from '@angular/cdk/coercion';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
	DatePipe,
	DecimalPipe,
	KeyValuePipe,
	NgTemplateOutlet
} from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	Injector,
	input,
	linkedSignal,
	numberAttribute,
	OnDestroy,
	resource, Signal, signal,
	untracked
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AppAbility } from '@app/adapters/casl';
import {
	BadgeCell,
	DateCell,
	MapComponent,
	VersionCell
} from '@app/components';
import { ActionCell } from '@app/components/tabular-field/cells';
import { ValueTypePipe } from '@app/pipes/value-type-pipe';
import { FORM_SERVICE } from '@app/services/form';
import {
	DeleteSubmission,
	InitVersioning,
	ToggleApprovalStatus
} from '@app/store/form';
import { AbilityServiceSignal } from '@casl/angular';
import {
	FindSubmissionVersionsRequestSchema,
	FindSubmissionVersionsResponse,
	FormType,
	SubmissionVersionInfo
} from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideArrowLeft,
	lucideArrowRight,
	lucideCalendar,
	lucideCheck,
	lucideCheckCircle,
	lucideCopy,
	lucideDot,
	lucideLoader,
	lucideMapPin,
	lucidePencil,
	lucideTrash2,
	lucideX
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmH3, HlmH4 } from '@spartan-ng/helm/typography';
import {
	createAngularTable,
	createColumnHelper,
	FlexRender,
	flexRenderComponent,
	getCoreRowModel,
	getPaginationRowModel
} from '@tanstack/angular-table';
import { intersection } from 'lodash';
import { toast } from 'ngx-sonner';
import {
	filter,
	interval,
	map,
	share,
	Subject,
	take,
	takeUntil,
	tap
} from 'rxjs';

const ch = createColumnHelper<SubmissionVersionInfo>();

@Component({
	selector: 'cv-overview',
	viewProviders: [
		provideIcons({
			lucideTrash2,
			lucideMapPin,
			lucideArrowLeft,
			lucideX,
			lucideLoader,
			lucideArrowRight,
			lucideCalendar,
			lucideDot,
			lucideCheck,
			lucideCopy,
			lucidePencil,
			lucideCheckCircle,
		})
	],
	imports: [
		HlmH3,
		NgIcon,
		HlmPaginationImports,
		HlmButton,
		TranslatePipe,
		KeyValuePipe,
		NgTemplateOutlet,
		ValueTypePipe,
		DecimalPipe,
		DatePipe,
		HlmSeparator,
		HlmLabel,
		HlmH4,
		HlmAlertDialogImports,
		HlmSwitch,
		BrnAlertDialogImports,
		HlmTableImports,
		RouterLink,
		FlexRender,
		MapComponent
	],
	templateUrl: './overview.page.html',
	styleUrl: './overview.page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewPage implements OnDestroy {
	readonly submissionIndex = input<number, NumberInput>(0, { transform: numberAttribute });
	readonly formType = input<FormType>();

	private readonly cdr = inject(ChangeDetectorRef);
	private readonly io = inject(BreakpointObserver);
	private readonly ts = inject(TranslateService);

	protected abs = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);
	protected readonly deleting = signal(false);
	protected readonly togglingApprovalStatus = signal(false);
	protected readonly deleteDialogState = signal<BrnDialogState>('closed');
	protected readonly isSmallScreen = toSignal(this.io.observe([
		Breakpoints.Tablet,
		Breakpoints.TabletLandscape,
		Breakpoints.TabletPortrait,
		Breakpoints.Handset,
		Breakpoints.HandsetPortrait,
		Breakpoints.HandsetLandscape,
	]).pipe(
		map(s => s.matches)
	))
	protected readonly page = signal(0);
	protected readonly route = inject(ActivatedRoute);
	protected readonly toggleApprovalStatus = dispatch(ToggleApprovalStatus);
	private readonly initVersioning = dispatch(InitVersioning);
	private readonly formService = inject(FORM_SERVICE);
	protected readonly facilityInfo = resource({
		defaultValue: null,
		params: () => ({
			form: this.formType(),
			index: this.submissionIndex()
		}),
		loader: async ({ params: { index, form } }) => {
			if (form === undefined || index === undefined) return null;
			return await this.formService.getFacilityInfo({ form, index });
		}
	});
	protected readonly approved = linkedSignal(() => {
		return this.facilityInfo.value()?.approved ?? false;
	})
	protected selectedVersion = resource({
		defaultValue: null,
		params: () => ({
			form: this.formType()!,
			index: this.submissionIndex(),
		}),
		loader: async ({ params: { index, form } }) => {
			if (index === null) return null;
			const v = await this.formService.findCurrentSubmissionVersion({
				index,
				form,
			});
			return v?.version ?? null;
		}
	});
	private navigate = dispatch(Navigate);
	private injector = inject(Injector);
	private deleteSubmission = dispatch(DeleteSubmission);
	private dr = inject(DestroyRef);
	protected readonly versions = resource({
		defaultValue: [],
		params: () => ({
			index: this.submissionIndex(),
			form: this.formType()
		}),
		loader: async ({ params: { form, index } }) => {
			if (index == null) return [] as FindSubmissionVersionsResponse;
			return await this.formService.findSubmissionVersions(FindSubmissionVersionsRequestSchema.parse({
				form, index: index, limit: 50
			}));
		},
	});
	protected readonly neighboringRefs = resource({
		params: () => ({
			index: this.submissionIndex(),
			form: this.formType()!
		}),
		loader: async ({ params: { form, index } }) => {
			return await this.formService.findSurroundingSubmissionRefs({
				form, index
			});
		},
	});
	protected readonly canGoNext = computed(() => {
		return this.neighboringRefs.value()?.[1] != null;
	});
	protected readonly canGoPrev = computed(() => {
		return this.neighboringRefs.value()?.[0] != null;
	})
	protected table = createAngularTable<SubmissionVersionInfo>(() => {
		return {
			getCoreRowModel: getCoreRowModel(),
			getPaginationRowModel: getPaginationRowModel(),
			state: {
				pagination: {
					pageSize: 5,
					pageIndex: 0
				}
			},
			data: this.versions.value(),
			columns: [
				ch.accessor('version', {
					header: 'misc.version',
					cell: ({ row }) => flexRenderComponent(VersionCell, {
						inputs: {
							version: row.original.version,
							allowCopy: false
						}
					})
				}),
				ch.accessor('changed_by', {
					header: 'misc.changed_by',
					cell: ({ row }) => row.original.changed_by ?? 'N/A'
				}),
				ch.accessor('changed_at', {
					header: 'misc.changed_at',
					cell: () => flexRenderComponent(DateCell)
				}),
				ch.accessor('change_notes', {
					header: 'misc.notes',
				}),
				ch.display({
					id: 'status',
					header: 'misc.status',
					cell: ({ row }) => {
						return flexRenderComponent(BadgeCell, {
							inputs: {
								shouldTranslateText: true,
								text: row.original.version === this.selectedVersion.value() ? 'overview.versions.columns.status.badges.active' : undefined,
								variant: 'outline'
							}
						})
					}
				}),
				ch.display({
					id: 'actions',
					cell: ({ row }) => flexRenderComponent(ActionCell<SubmissionVersionInfo>, {
						inputs: {
							actions: [
								{ identifier: 'edit', icon: 'lucidePencil', permissions: ['update', 'Submission'] }
							],
						},
						outputs: {
							actionTriggered: ({ identifier }) => {
								if (identifier == 'edit') {
									this.navigate(['..'], { version: row.original.version }, {
										relativeTo: this.route,
										queryParamsHandling: 'merge'
									})
								}
							}
						}
					})
				})
			]
		}
	});

	private deleteRelease = new Subject<void>();
	protected deleteTimer?: Signal<number | undefined>;
	private revertingToggle = false;

	constructor() {
		effect(() => {
			const status = this.versions.status()
			if (intersection([status], ['resolved']).length == 0 || this.versions.value().length > 0) return;
			this.initVersioning(untracked(this.submissionIndex), untracked(this.formType)!).subscribe({
				complete: () => {
					this.versions.reload();
					this.selectedVersion.reload();
				}
			});
		});
	}

	protected deleteButtonReleased() {
		this.deleteRelease.next();
		this.deleteTimer = undefined;
		this.cdr.markForCheck();
	}

	protected deleteButtonPressed() {
		const src$ = interval(1000).pipe(
			takeUntilDestroyed(this.dr),
			takeUntil(this.deleteRelease),
			take(6),
			map(n => 5 - n),
			share()
		);
		this.deleteTimer = toSignal(src$.pipe(
			tap(() => this.cdr.markForCheck()),
		), { injector: this.injector });

		src$.pipe(
			filter(n => n <= 0),
			take(1)
		).subscribe({
			next: () => {
				this.deleteButtonReleased();

				this.deleting.set(true);
				const index = untracked(this.submissionIndex);
				this.deleteSubmission(index, this.formType()!).subscribe({
					error: (e: Error) => {
						this.deleting.set(false);
						toast.error(this.ts.instant('overview.submission_info.alerts.delete_confirmation.msg.failed'), { description: e.message });
					},
					complete: () => {
						this.deleting.set(true);
						toast.success(this.ts.instant('overview.submission_info.alerts.delete_confirmation.msg.success'))
						this.navigate(['/submissions']);
					}
				});
			}
		})
		this.cdr.markForCheck();
	}

	ngOnDestroy(): void {
		this.deleteRelease.complete();
	}

	protected approvalSwitchToggled(value: boolean) {
		if (this.revertingToggle) return;
		const index = this.submissionIndex();
		const ft = this.formType()!;
		this.togglingApprovalStatus.set(true);
		this.toggleApprovalStatus(index, ft, value).subscribe({
			error: (e: Error) => {
				this.togglingApprovalStatus.set(false);
				this.revertingToggle = true;
				this.approved.set(this.facilityInfo.value()?.approved ?? false);
				toast.error(this.ts.instant('msg.error.title'), { description: e.message });
				this.revertingToggle = false;
			},
			complete: () => {
				this.togglingApprovalStatus.set(false);
				this.facilityInfo.reload();
				toast.success(this.ts.instant('msg.changes_saved.description'));
			}
		});
	}
}
