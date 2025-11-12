import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, Injector, input, model, OnInit, output, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SetFormType } from '@app/store/form';
import { currentLocale, lastFocusedFormType } from '@app/store/selectors';
import { debounceSignal, maskString } from '@app/util';
import { FormSubmission, FormType, FormTypeSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideRefreshCw } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
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
import { AgoDatePipePipe } from '@app/pipes';


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
	selector: 'cv-date-cell',
	imports: [DatePipe, AgoDatePipePipe],
	template: `
		<span [title]="date() | date:'dd/MM/yyyy HH:mm'">{{ date() | ago_date:actualLocale() }}</span>
	`,
})
export class DateCell {
	readonly date = input<Date>();
	readonly locale = select(currentLocale);
	protected readonly actualLocale = computed(() => {
		return (this.locale().startsWith('en') ? 'en-CM' : 'fr-CM').slice(0, 2);
	})
}

type Action = {
	label?: string;
	icon?: string;
	id: string;
}

@Component({
	selector: 'cv-actions-cell',
	imports: [HlmButton, NgIcon, TranslatePipe],
	template: `
		@if ((actions() ?? []).length > 0) {
			@for (action of actions(); track action.id) {
				<button (click)="actionTriggered.emit(action.id)" hlmBtn variant="ghost"
								[size]="!action.label && action.icon ? 'icon' : 'default'">
					@if (action.icon) {
						<ng-icon [name]="action.icon"/>
					}
					@if (action.label) {
						<span>{{ _static() ? action.label : (action.label | translate) }} </span>
					}
				</button>
			}
		}
	`,
	styles: `
		:host {
			@apply inline-flex justify-start items-center;
		}
	`
})
export class ButtonCell {
	readonly actions = input<Action[]>();
	readonly actionTriggered = output<string>();
	readonly shouldTranslateText = input<boolean>();

	protected readonly _static = computed(() => !this.shouldTranslateText());
}

@Component({
	selector: 'cv-submissions',
	viewProviders: [
		provideIcons({
			lucideRefreshCw,
			lucidePencil
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
		TranslatePipe
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
			cell: ({ renderValue }) => {
				const rv = renderValue();
				return rv ? maskString(rv) : rv;
			}
		}),
		this.columnHelper.display({
			id: 'actions',
			header: () => '',
			cell: ({ row }) => {
				return flexRenderComponent(ButtonCell, {
					inputs: {
						shouldTranslateText: true,
						actions: [
							{ id: 'open', icon: 'lucidePencil', label: 'misc.actions.modify' }
						]
					},
					outputs: {
						actionTriggered: (value) => {
							if (value == 'open') {
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

	protected openSubmission(index: number, version: string | null) {
		this.navigate(['/forms', this.formType(), index], version ? { version } : undefined);
	}

	ngOnInit(): void {
	}

	protected onFormTypeChanged(type: FormType) {
		this.setFormType(type);
	}
}
