import { DecimalPipe } from '@angular/common';
import {
	Component,
	computed,
	HostBinding,
	inject,
	Injector,
	input,
	model,
	OnInit,
	resource,
	signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetFormType } from '@app/store/form';
import { lastFocusedFormType } from '@app/store/selectors';
import { debounceSignal } from '@app/util';
import { FormSubmission, FormType, FormTypeSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideCopy,
	lucideEye,
	lucideInbox,
	lucidePencil,
	lucideRefreshCw
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BadgeVariants, HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import {
	createAngularTable,
	createColumnHelper,
	FlexRender,
	flexRenderComponent,
	getCoreRowModel
} from '@tanstack/angular-table';
import { ElectronFormService } from '@app/services/electron/form.service';
import { MaskPipe } from '@app/pipes';
import { toast } from 'ngx-sonner';
import { DateCell } from '@app/components/tabular-field/date-cell.component';
import { ActionCell } from '@app/components/tabular-field/cells';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'cv-version-cell',
	imports: [HlmButton, NgIcon, MaskPipe, TranslatePipe],
	viewProviders: [
		provideIcons({
			lucideCopy
		})
	],
	host: {
		class: 'text-sm'
	},
	template: `
		@if (version()) {
			<span>{{ version() | mask }}</span>
			<button [title]="'misc.actions.copy_version' | translate" (click)="onCopyVersionButtonClicked()" size="sm"
							variant="ghost" hlmBtn>
				<ng-icon name="lucideCopy"/>
			</button>
		}
	`
})
export class VersionCell {
	readonly version = input<string>();
	@HostBinding('class.inline-flex')
	@HostBinding('class.gap-2')
	@HostBinding('class.items-center')
	protected readonly versionDefined = computed(() => !!this.version())

	private ts = inject(TranslateService);

	protected async onCopyVersionButtonClicked() {
		await navigator.clipboard.writeText(this.version() as string);
		toast.info(this.ts.instant('msg.clipboard_copied_text', { value: 'Version' }));
	}
}

@Component({
	selector: 'cv-badge-cell',
	imports: [HlmBadgeImports, TranslatePipe],
	template: `
		@if (_static()) {
			<span hlmBadge [variant]="variant()"> {{ text() }}</span>
		} @else {
			<span hlmBadge [variant]="variant()">{{ text() | translate }}</span>
		}
	`
})
export class BadgeCell {
	readonly variant = input<BadgeVariants['variant']>();
	readonly text = input.required<string>();
	readonly shouldTranslateText = input<boolean>();

	protected readonly _static = computed(() => !this.shouldTranslateText());
}

@Component({
	selector: 'cv-submissions',
	viewProviders: [
		provideIcons({
			lucideInbox,
			lucideRefreshCw,
			lucidePencil,
			lucideEye
		})
	],
	imports: [
		BrnSelectImports,
		FormsModule,
		NgIcon,
		HlmSelectImports,
		HlmButton,
		FlexRender,
		HlmTableImports,
		HlmInput,
		DecimalPipe,
		TranslatePipe,
		HlmEmptyImports,
		RouterLink
	],
	host: {
		'class': 'page'
	},
	templateUrl: './submissions.page.html',
	styleUrl: './submissions.page.scss'
})
export class SubmissionsPage implements OnInit {
	private navigate = dispatch(Navigate);
	private setFormType = dispatch(SetFormType);

	private readonly injector = inject(Injector);
	private formService = inject(ElectronFormService);
	protected readonly formTypeOptions = FormTypeSchema.options
	protected readonly formType = select(lastFocusedFormType);
	protected readonly pagination = signal({ pageIndex: 0, pageSize: 100 });
	protected readonly filter = model('');
	private readonly filterQuery = debounceSignal(this.filter);
	protected submissions = resource({
		params: () => ({ filter: this.filterQuery()?.trim(), form: this.formType(), pagination: this.pagination() }),
		loader: async ({ params: { form, pagination: { pageIndex, pageSize }, filter } }) => {
			if (!form) return { data: [], totalRecords: 0 };
			return await this.formService.findFormSubmissions(form, pageIndex, pageSize, filter);
		},
		defaultValue: { data: [], totalRecords: 0 }
	});
	protected readonly currentRange = computed(() => [
		this.pagination().pageIndex * this.pagination().pageSize,
		this.pagination().pageIndex * this.pagination().pageSize + Math.min(this.submissions.value()?.data.length ?? 0, this.pagination().pageSize)
	] as [number, number]);
	protected readonly totalPages = computed(() => {
		const totalRecords = this.submissions.value()?.totalRecords;
		if (totalRecords === undefined) return 0;

		const { pageSize } = this.pagination();
		return Math.ceil(totalRecords / pageSize);
	});
	private columnHelper = createColumnHelper<FormSubmission>();
	protected readonly columnConfig = [
		{
			accessorKey: 'validationStatus',
			header: 'submissions.columns.validation_status.title',
			cell: ({ getValue }: any) => flexRenderComponent(BadgeCell, {
				injector: this.injector,
				inputs: {
					shouldTranslateText: true,
					text: getValue() === 'validation_status_approved' ? 'submissions.columns.validation_status.options.approved' : 'submissions.columns.validation_status.options.unapproved',
					variant: getValue() === 'validation_status_approved' ? 'default' : 'secondary'
				}
			})
		},
		{
			accessorKey: 'index',
			header: 'submissions.columns.index.title'
		}, {
			accessorKey: 'facilityName',
			header: 'submissions.columns.facility_name.title'
		},
		this.columnHelper.accessor('validationCode', {
			id: 'validationCode',
			header: 'submissions.columns.validation_code.title'
		}),
		this.columnHelper.accessor('submissionTime', {
			header: 'submissions.columns.submission_date.title',
			cell: ({ getValue }) => flexRenderComponent(DateCell, {
				inputs: {
					date: getValue(),
				}
			})
		}),
		this.columnHelper.accessor('lastModifiedAt', {
			header: 'submissions.columns.last_modified_at.title',
			cell: ({ getValue }) => flexRenderComponent(DateCell, {
				inputs: { date: getValue() ?? undefined }
			})
		}),
		this.columnHelper.accessor('lastModifiedBy', {
			header: 'submissions.columns.last_modified_by.title',
		}),
		this.columnHelper.accessor('currentVersion', {
			header: 'submissions.columns.version.title',
			cell: ({ row }) => {
				return flexRenderComponent(VersionCell, {
					inputs: {
						version: row.original.currentVersion ?? undefined
					}
				})
			}
		}),
		this.columnHelper.display({
			id: 'actions',
			header: () => '',
			cell: ({ row }) => {
				return flexRenderComponent(ActionCell, {
					inputs: {
						shouldTranslateText: true,
						minimal: true,
						actions: [
							{ identifier: 'open', icon: 'lucidePencil', label: 'misc.actions.modify' },
							{ identifier: 'view', icon: 'lucideEye', label: 'misc.actions.open_overview' }
						]
					},
					outputs: {
						actionTriggered: ({ identifier }) => {
							if (identifier == 'open') {
								this.openSubmission(row.original.index, row.original.currentVersion, true);
							} else if (identifier == 'view') {
								this.openSubmission(row.original.index, row.original.currentVersion);
							}
						},
					}
				})
			}
		})
	];
	protected readonly table = createAngularTable(() => {
		return {
			data: this.submissions.value()?.data ?? [],
			manualPagination: true,
			rowCount: this.submissions.value()?.totalRecords ?? -1,
			columns: this.columnConfig,
			getCoreRowModel: getCoreRowModel(),
			onPaginationChange: updater => updater instanceof Function ? this.pagination.update(updater) : this.pagination.set(updater),
			initialState: {
				pagination: this.pagination(),
			}
		}
	});

	protected openSubmission(index: number, version: string | null, edit = false) {
		const segments = ['/forms', this.formType(), index];
		if (!edit) {
			segments.push('overview')
		}
		this.navigate(segments, version ? { version } : undefined);
	}

	ngOnInit(): void {
	}

	protected onFormTypeChanged(type: FormType) {
		this.setFormType(type);
	}
}
