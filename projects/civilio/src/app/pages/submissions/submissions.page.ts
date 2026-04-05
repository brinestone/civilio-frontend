import { DecimalPipe } from "@angular/common";
import {
	Component,
	computed,
	inject,
	Injector,
	model,
	signal,
} from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { DateCell } from "@app/components";
import { ActionCell } from "@app/components/tabular-field/cells";
import { SetFormType } from "@app/store/form";
import { debounceSignal } from "@app/util";
import { LookupFormSubmissions200 } from "@civilio/sdk/models";
import { SubmissionsService } from "@civilio/sdk/services/submissions/submissions.service";
import { FormType, FormTypeSchema } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideEye,
	lucideFormInput,
	lucideImport,
	lucideInbox,
	lucidePencil,
	lucidePlus,
	lucideRefreshCw,
} from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { Navigate } from "@ngxs/router-plugin";
import { dispatch } from "@ngxs/store";

import { HlmButton } from "@spartan-ng/helm/button";
import { HlmButtonGroupImports } from "@spartan-ng/helm/button-group";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmTableImports } from "@spartan-ng/helm/table";
import {
	createAngularTable,
	createColumnHelper,
	FlexRender,
	flexRenderComponent,
	getCoreRowModel,
} from "@tanstack/angular-table";

@Component({
	selector: "cv-submissions",
	viewProviders: [
		provideIcons({
			lucideInbox,
			lucideRefreshCw,
			lucidePencil,
			lucideImport,
			lucideFormInput,
			lucidePlus,
			lucideEye,
		}),
	],
	imports: [
		FormsModule,
		NgIcon,
		HlmSelectImports,
		HlmButton,
		FlexRender,
		HlmTableImports,
		HlmInput,
		DecimalPipe,
		HlmDropdownMenuImports,
		TranslatePipe,
		HlmEmptyImports,
		RouterLink,
	],
	host: {
		class: "page",
	},
	templateUrl: "./submissions.page.html",
	styleUrl: "./submissions.page.scss",
})
export class SubmissionsPage {
	private navigate = dispatch(Navigate);
	private setFormType = dispatch(SetFormType);

	private readonly injector = inject(Injector);
	private submissionService = inject(SubmissionsService);
	protected readonly formTypeOptions = FormTypeSchema.options;
	protected readonly pagination = signal({ pageIndex: 0, pageSize: 100 });
	protected readonly filter = model("");
	private readonly filterQuery = debounceSignal(this.filter);
	protected readonly submissions = rxResource({
		defaultValue: { totalRecords: 0, data: [] },
		params: () => ({
			filter: this.filterQuery(),
			pagination: this.pagination(),
		}),
		stream: ({ params }) => {
			return this.submissionService.lookupFormSubmissions({
				limit: params.pagination.pageSize,
				page: params.pagination.pageIndex,
			});
		},
	});
	protected readonly totalRecords = computed(
		() => this.submissions.value().totalRecords ?? 0,
	);
	protected readonly currentRange = computed(
		() =>
			[
				this.pagination().pageIndex * this.pagination().pageSize,
				this.pagination().pageIndex * this.pagination().pageSize +
					Math.min(
						this.submissions.value()?.data.length ?? 0,
						this.pagination().pageSize,
					),
			] as [number, number],
	);
	protected readonly totalPages = computed(() => {
		const totalRecords = this.submissions.value()?.totalRecords;
		if (totalRecords === undefined) return 0;

		const { pageSize } = this.pagination();
		return Math.ceil(totalRecords / pageSize);
	});
	private columnHelper =
		createColumnHelper<LookupFormSubmissions200["data"][number]>();
	protected readonly columnConfig = [
		this.columnHelper.accessor("form", {
			header: "submissions.columns.validation_code.title",
		}),
		this.columnHelper.accessor("recordedAt", {
			header: "submissions.columns.submission_date.title",
			cell: ({ getValue }) =>
				flexRenderComponent(DateCell, {
					inputs: {
						date: getValue(),
					},
				}),
		}),
		this.columnHelper.accessor("lastUpdatedAt", {
			header: "submissions.columns.last_modified_at.title",
			cell: ({ getValue }) =>
				flexRenderComponent(DateCell, {
					inputs: { date: getValue() ?? undefined },
				}),
		}),
		this.columnHelper.display({
			id: "actions",
			header: () => "",
			cell: ({ row }) => {
				return flexRenderComponent(ActionCell, {
					inputs: {
						shouldTranslateText: true,
						minimal: true,
						actions: [
							{
								identifier: "open",
								icon: "lucidePencil",
								label: "misc.actions.modify",
							},
							{
								identifier: "view",
								icon: "lucideEye",
								label: "misc.actions.open_overview",
							},
						],
					},
					outputs: {
						actionTriggered: ({ identifier }) => {
							// if (identifier == 'open') {
							// 	this.openSubmission(row.original.index, row.original.currentVersion, true);
							// } else if (identifier == 'view') {
							// 	this.openSubmission(row.original.index, row.original.currentVersion);
							// }
						},
					},
				});
			},
		}),
	];
	protected readonly table = createAngularTable(() => {
		return {
			data: this.submissions.value().data,
			manualPagination: true,
			rowCount: this.submissions.value().totalRecords,
			columns: this.columnConfig,
			getCoreRowModel: getCoreRowModel(),
			onPaginationChange: (updater) =>
				updater instanceof Function
					? this.pagination.update(updater)
					: this.pagination.set(updater),
			initialState: {
				pagination: this.pagination(),
			},
		};
	});

	protected openSubmission(
		index: number,
		version: string | null,
		edit = false,
	) {
		const segments = ["/forms", "", index]; // TODO: Update this and provide the form's slug instead
		if (!edit) {
			segments.push("overview");
		}
		this.navigate(segments, version ? { version } : undefined);
	}

	protected onFormTypeChanged(type: FormType) {
		this.setFormType(type);
		this.table.resetPageIndex();
	}

	protected onNewSubmissionButtonClicked() {
		this.navigate(["/forms", "", "new"]); // TODO: Update this and provide the form's slug instead
	}
}
