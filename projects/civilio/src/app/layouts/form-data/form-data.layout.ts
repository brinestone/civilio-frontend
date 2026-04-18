import { NgTemplateOutlet } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	HostBinding,
	inject,
	input,
	linkedSignal,
	signal,
} from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { SubmissionLookup } from "@civilio/sdk/models";
import { FormsService } from "@civilio/sdk/services/forms/forms.service";
import { SubmissionsService } from "@civilio/sdk/services/submissions/submissions.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronLeft, lucideChevronRight, lucideInbox, lucidePlus } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmNumberedPagination } from "@spartan-ng/helm/pagination";
import { HlmSelectImports } from "@spartan-ng/helm/select";

import { HlmButton } from "@spartan-ng/helm/button";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { HlmTableImports } from "@spartan-ng/helm/table";
import {
	ColumnDef,
	createAngularTable,
	createColumnHelper,
	FlexRender,
	getCoreRowModel,
	PaginationState,
} from "@tanstack/angular-table";
import { injectQueryParams } from "ngxtension/inject-query-params";

const ch = createColumnHelper<SubmissionLookup>();

@Component({
	selector: "cv-form-data-layout",
	templateUrl: "./form-data.layout.html",
	styleUrl: "./form-data.layout.scss",
	imports: [
		HlmTableImports,
		HlmEmptyImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmNumberedPagination,
		HlmSkeleton,
		HlmButton,
		HlmBadge,
		NgTemplateOutlet,
		FlexRender,
		HlmSpinner,
		NgIcon,
		RouterLink,
		TranslatePipe,
	],
	viewProviders: [
		provideIcons({
			lucideInbox,
			lucideChevronLeft,
			lucideChevronRight,
			lucidePlus
		}),
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDataLayout {
	readonly slug = input.required<string>();

	protected readonly route = inject(ActivatedRoute);

	@HostBinding("class.selection-active")
	protected readonly childActivated = !!this.route.firstChild;

	private readonly submissionService = inject(SubmissionsService);
	private readonly formService = inject(FormsService);
	private readonly versionSelectedArg = injectQueryParams("fv");
	protected readonly formVersions = rxResource({
		params: () => ({ slug: this.slug() }),
		stream: ({ params }) => {
			return this.formService.lookupFormVersions(params.slug);
		},
	});
	protected readonly selectVersionId = linkedSignal(() => {
		const fv = this.versionSelectedArg();
		const current = this.formVersions.value()?.find((v) => v.isCurrent);
		return fv ? fv : current?.id;
	});
	protected readonly selectFormVersion = computed(() => {
		return this.formVersions
			.value()
			?.find((v) => v.id === this.selectVersionId());
	});
	protected readonly submissionData = rxResource({
		params: () => ({
			pagination: this.pagination(),
			slug: this.slug(),
			version: this.selectVersionId()
		}),
		defaultValue: {
			totalRecords: 0,
			data: [],
		},
		stream: ({ params }) => {
			return this.submissionService.lookupFormSubmissions({
				form: params.slug,
				fv: params.version,
				page: params.pagination.pageIndex,
				limit: params.pagination.pageSize
			});
		},
	});
	protected readonly columnConfig: ColumnDef<SubmissionLookup, any>[] = [
		ch.accessor("index", {
			header: "form.submissions.table.columns.index.header",
		}),
		ch.accessor("lastUpdatedAt", {
			header: "form.submissions.table.columns.lastModified.header",
		}),
		ch.accessor("recordedAt", {
			header: "form.submissions.table.columns.recorded.header",
		}),
		ch.accessor("versionCount", {
			header: "form.submissions.table.columns.versionCount.header",
		}),
	];
	protected readonly pageIndex = signal<number>(0);
	protected readonly pageSize = signal<number>(100);
	protected readonly pagination = computed(() => ({
		pageIndex: Math.max(0, this.pageIndex() - 1),
		pageSize: this.pageSize()
	}));
	protected readonly table = createAngularTable(() => ({
		data: this.submissionData.value().data,
		getCoreRowModel: getCoreRowModel(),
		columns: this.columnConfig,
		autoResetPageIndex: true,
	}));
}
