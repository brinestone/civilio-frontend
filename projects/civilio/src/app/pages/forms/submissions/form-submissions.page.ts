import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	inject,
	input,
	linkedSignal,
	signal
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { DateCell } from "@app/components";
import { ActionCell, NumericCell } from "@app/components/tabular-field/cells";
import { RelativeDatePipe } from "@app/pipes";
import { formVersionsCollection, responseSessionsCollection } from "@db/collections";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideCheck,
	lucideChevronLeft,
	lucideChevronRight,
	lucideInbox,
	lucidePencil,
	lucidePlus,
} from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmNumberedPagination } from "@spartan-ng/helm/pagination";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { and, count, eq, injectLiveQuery, isNull, max } from "@tanstack/angular-db";
import {
	ColumnDef,
	createAngularTable,
	createColumnHelper,
	FlexRender,
	flexRenderComponent,
	getCoreRowModel,
} from "@tanstack/angular-table";
import { map } from "rxjs";

type SubmissionRef = {
	versionCount: number;
	index: number;
	lastModified: number;
	recordedAt: number;
}
const ch = createColumnHelper<SubmissionRef>();

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
		NgTemplateOutlet,
		FlexRender,
		HlmSpinner,
		NgIcon,
		RouterLink,
		RelativeDatePipe,
		DecimalPipe,
		TranslatePipe,
	],
	viewProviders: [
		provideIcons({
			lucideInbox,
			lucideChevronLeft,
			lucideCheck,
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
	private pageRoute = inject(ActivatedRoute);
	private readonly versionSelectedArg = toSignal(this.pageRoute.data.pipe(map(({ fv }) => fv as string)))
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
				.from({ fv: formVersionsCollection })
				.where(({ fv }) => eq(fv.form, params.slug)),
	});
	protected readonly selectVersionId = linkedSignal(() => String(this.versionSelectedArg()));
	protected readonly selectFormVersion = computed(() => {
		return this.formVersions
			.data()
			?.find((v) => v.id === this.selectVersionId());
	});
	protected readonly tableData = injectLiveQuery({
		params: () => ({ version: this.selectVersionId() }),
		query: ({ q, params }) => q.from({ session: responseSessionsCollection })
			.where(({ session }) => and(eq(session.formVersion, params.version), isNull(session.archivedAt)))
			.groupBy(({ session }) => session.index)
			.select(({ session }) => ({
				versionCount: count(session.id),
				index: session.index,
				lastModified: max(session.createdAt)
			}))
			.orderBy(({ $selected }) => $selected.lastModified, { direction: 'desc' })
	});
	private readonly router = inject(Router);
	protected readonly columnConfig: ColumnDef<SubmissionRef, any>[] = [
		ch.accessor("index", {
			header: "form.submissions.table.columns.index.header",
			cell: () => flexRenderComponent(NumericCell, {
				inputs: { digitsInfo: '3.0-0' }
			})
		}),
		ch.accessor("lastModified", {
			header: "form.submissions.table.columns.lastModified.header",
			cell: () => flexRenderComponent(DateCell)
		}),
		ch.accessor("versionCount", {
			header: "form.submissions.table.columns.versionCount.header",
		}),
		ch.display({
			id: 'actions',
			cell: () => flexRenderComponent(ActionCell, {
				inputs: {
					shouldTranslateText: false,
					minimal: true,
					actions: [
						{ identifier: 'edit', icon: 'lucidePencil', label: 'Edit' }
					]
				},
				outputs: {
					actionTriggered: (event) => {
						if (event.identifier == 'edit')
							this.router.navigate([(event.row as any).index], {
								queryParamsHandling: 'merge',
								queryParams: { session: 'current' },
								relativeTo: this.pageRoute
							});
					}
				}
			}),
		}),
	];
	protected readonly table = createAngularTable(() => ({
		data: this.tableData.data() as any,
		getCoreRowModel: getCoreRowModel(),
		columns: this.columnConfig,
		autoResetPageIndex: true,
	}));
}
