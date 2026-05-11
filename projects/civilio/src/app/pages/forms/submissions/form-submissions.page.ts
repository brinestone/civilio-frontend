import { NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	effect,
	input,
	linkedSignal,
	signal
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SubmissionLookup } from "@civilio/sdk/models";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideChevronLeft,
	lucideChevronRight,
	lucideInbox,
	lucidePencil,
	lucidePlus,
} from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmBadge } from "@spartan-ng/helm/badge";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmNumberedPagination } from "@spartan-ng/helm/pagination";
import { HlmSelectImports } from "@spartan-ng/helm/select";

import { ActionCell } from "@app/components/tabular-field/cells";
import {
	formVersionCollection,
	submissionCollection,
} from "@app/store/form/collections";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { and, eq, injectLiveQuery } from "@tanstack/angular-db";
import {
	ColumnDef,
	createAngularTable,
	createColumnHelper,
	FlexRender,
	flexRenderComponent,
	getCoreRowModel,
} from "@tanstack/angular-table";
import { injectQueryParams } from "ngxtension/inject-query-params";

const ch = createColumnHelper<SubmissionLookup>();

@Component({
	selector: "cv-form-data-layout",
	templateUrl: "./form-submissions.page.html",
	styleUrl: "./form-submissions.page.scss",
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
			lucidePlus,
		}),
	],
	providers: [
		provideIcons({
			lucidePencil
		})
	],
})
export class FormSubmissionsPage {
	readonly slug = input<string>();
	private readonly versionSelectedArg = injectQueryParams("fv");
	protected readonly pageIndex = signal<number>(0);
	protected readonly pageSize = signal<number>(100);
	protected readonly pagination = computed(() => ({
		pageIndex: Math.max(0, this.pageIndex() - 1),
		pageSize: this.pageSize(),
	}));
	protected readonly formVersions = injectLiveQuery({
		params: () => ({ slug: this.slug() }),
		query: ({ q, params }) =>
			q
				.from({ fv: formVersionCollection })
				.where(({ fv }) => eq(fv.form, params.slug)),
	});
	protected readonly selectVersionId = linkedSignal(() => {
		const fv = this.versionSelectedArg();
		const current = this.formVersions.data()?.find((v) => v.isCurrent);
		return fv ? fv : current?.id;
	});
	protected readonly selectFormVersion = computed(() => {
		return this.formVersions
			.data()
			?.find((v) => v.id === this.selectVersionId());
	});
	protected readonly submissionData = injectLiveQuery({
		params: () => ({
			pagination: this.pagination(),
			slug: this.slug(),
			version: this.selectVersionId(),
		}),
		query: ({ q, params }) =>
			q.from({ s: submissionCollection }).where(({ s }) => {
				const clauses = [];
				if (params.version) {
					clauses.push(eq(s.formVersion, params.version));
				}
				return params.version
					? and(eq(s.form, params.slug), eq(s.formVersion, params.version))
					: eq(s.form, params.slug);
			}),
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
		ch.display({
			cell: ({ }) => flexRenderComponent(ActionCell, {
				inputs: {
					shouldTranslateText: false,
					minimal: true,
					actions: [
						{ identifier: 'edit', icon: 'lucidePencil', label: 'Edit' }
					]
				}
			}), id: 'actions'
		}),
	];
	protected readonly table = createAngularTable(() => ({
		data: this.submissionData.data(),
		getCoreRowModel: getCoreRowModel(),
		columns: this.columnConfig,
		autoResetPageIndex: true,
	}));

	constructor() {
		effect(() => {
			const formVersions = this.formVersions.data();
			const submissions = this.submissionData.data();

			console.log('fv', formVersions);
			console.log('submissions', submissions);
		})
	}
}
