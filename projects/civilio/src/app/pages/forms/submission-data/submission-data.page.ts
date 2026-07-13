import { NumberInput } from "@angular/cdk/coercion";
import { DatePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	effect,
	input,
	isDevMode,
	linkedSignal,
	numberAttribute,
	signal,
	untracked
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormRenderer } from '@app/components/form/renderer';
import { formItemsCollection, formVersionsCollection, responseCollection, responseSessionsCollection } from "@db/collections";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmAlertImports } from "@spartan-ng/helm/alert";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmField, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { injectLiveQuery } from "@tanstack/angular-db";
import { and, count, eq, queryOnce } from "@tanstack/db";
import { createDraft, finishDraft, produce } from "immer";
import { injectQueryParams } from "ngxtension/inject-query-params";
const newSessionId = () => crypto.randomUUID();
@Component({
	selector: "cv-form-data-page",
	templateUrl: "./submission-data.page.html",
	styleUrl: "./submission-data.page.scss",
	viewProviders: [
		provideIcons({
			lucideAlertTriangle
		})
	],
	imports: [
		HlmSelectImports,
		BrnSelectImports,
		HlmAlertImports,
		HlmEmptyImports,
		NgClass,
		HlmField,
		NgIcon,
		HlmFieldLabel,
		NgTemplateOutlet,
		HlmSkeleton,
		DatePipe,
		RouterLink,
		FormRenderer
	],
})
export class SubmissionDataPage {
	readonly index = input<number | undefined, NumberInput>(undefined, {
		transform: numberAttribute,
	});
	readonly formSlug = input<string>(undefined, { alias: "slug" });
	readonly sessionId = input<string>(undefined, { alias: "session" });
	private readonly formVersionArg = injectQueryParams('version');

	protected readonly isDevMode = isDevMode;
	protected readonly submissionData = signal<Record<string, unknown>>({});
	protected readonly isNew = computed(() => this.index() === undefined);
	protected readonly pageIndex = signal<number>(0);
	protected readonly pageSize = signal<number>(100);
	protected readonly pagination = computed(() => ({
		pageIndex: Math.max(0, this.pageIndex() - 1),
		pageSize: this.pageSize(),
	}));
	protected readonly formVersion = linkedSignal(() => this.formVersionArg());
	protected readonly formDefinition = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), version: this.formVersion() }),
		query: ({ q, params: { slug, version } }) => {
			return q.from({
				fi: formItemsCollection,
			}).innerJoin({ fv: formVersionsCollection }, ({ fi, fv }) => eq(fi.formVersion, fv.id))
				.where(({ fv }) => and(eq(fv.form, slug), version ? eq(fv.id, version) : eq(fv.isCurrent, true)))
				.orderBy(({ fi }) => fi.path, 'asc')
				.select(({ fi }) => fi);
		}
	});
	protected readonly formVersions = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), pagination: this.pagination() }),
		query: ({ q, params }) =>
			q
				.from({ fv: formVersionsCollection })
				.where(({ fv }) => eq(fv.form, params.slug))
				.limit(params.pagination.pageSize)
				.orderBy(({ fv }) => fv.updatedAt, "desc")
				.offset(params.pagination.pageIndex * params.pagination.pageSize),
	});
	protected readonly submissions = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), index: this.index(), fv: this.formVersion() }),
		query: ({ q, params }) =>
			q
				.from({ sessions: responseSessionsCollection })
				.where(
					({ sessions }) => and(
						eq(sessions.form, params.slug),
						eq(sessions.formVersion, params.fv)
					),
				).groupBy(({ sessions }) => [sessions.index, sessions.createdAt])
				.select(({ sessions }) => ({
					index: sessions.index,
					recordedAt: sessions.createdAt,
					vc: count(sessions)
				})),
	});
	protected readonly questionItems = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), version: this.formVersion() }),
		query: ({ q, params: { slug, version } }) => {
			return q.from({
				fi: formItemsCollection,
			}).innerJoin({ fv: formVersionsCollection }, ({ fi, fv }) => eq(fi.formVersion, fv.id))
				.where(({ fv, fi }) => and(eq(fi.type, 'question'), and(eq(fv.form, slug), version ? eq(fv.id, version) : eq(fv.isCurrent, true))))
				.select(({ fi }) => fi);
		}
	});
	#updateSubmissionData = effect(async () => {
		const questions = this.questionItems.data();
		const draft = createDraft(untracked(this.submissionData));
		for (const item of questions) {
			const response = await queryOnce(q => q.from(({ res: responseCollection }))
				.join(({ fi: formItemsCollection }), ({ res, fi }) => eq(fi.id, res.formItem))
				.join(({ se: responseSessionsCollection }), ({ res, se }) => eq(se.id, res.sessionId))
				.where(({ res, se }) => and(eq(res.formItem, item.id), and(eq(se.id, this.sessionId()), eq(se.form, this.formSlug()), eq(se.formVersion, this.formVersion()))))
				.select(({ res }) => res)
				.findOne()
			);
			draft[item.config!.dataKey] = response?.value ?? item.config?.defaultValue ?? null;
		}
		this.submissionData.set(finishDraft(draft));
	});
}
