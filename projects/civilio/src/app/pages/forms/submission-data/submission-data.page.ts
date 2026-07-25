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
import { SectionRenderer } from '@app/components/form/renderer';
import { SubmissionData } from "@civilio/sdk/models";
import { formItemsCollection, formVersionsCollection, responseCollection, responseSessionsCollection } from "@db/collections";
import { QuestionItemEntity } from "@db/types";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmAlertImports } from "@spartan-ng/helm/alert";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmField, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { injectLiveQuery } from "@tanstack/angular-db";
import { injectForm, injectStore } from "@tanstack/angular-form";
import { and, count, eq, inArray, queryOnce } from "@tanstack/db";
import { createDraft, finishDraft } from "immer";
import { identity, set } from "lodash";
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
		SectionRenderer
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
	protected readonly questions = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), version: this.formVersion() }),
		query: ({ q, params: { slug, version } }) => {
			return q.from({
				fi: formItemsCollection,
			}).innerJoin({ fv: formVersionsCollection }, ({ fi, fv }) => eq(fi.formVersion, fv.id))
				.where(({ fv, fi }) => and(inArray(fi.type, ['question']), and(eq(fv.form, slug), version ? eq(fv.id, version) : eq(fv.isCurrent, true))))
				.select(({ fi }) => fi);
		}
	});
	#updateSubmissionData = effect(async () => {
		const questions = this.questions.data() as QuestionItemEntity[];
		const draft = createDraft(untracked(this.submissionData));
		for (const item of questions) {
			if (item.type == 'question') {
				const response = await queryOnce(q => q.from({ res: responseCollection })
					.join({ fi: formItemsCollection }, ({ res, fi }) => eq(fi.id, res.formItem))
					.join({ se: responseSessionsCollection }, ({ res, se }) => eq(se.id, res.sessionId))
					.leftJoin({ parentItem: formItemsCollection }, ({ parentItem, fi }) => eq(parentItem.id, fi.parentId))
					.where(({ res, se }) => and(eq(res.formItem, item.id), and(eq(se.id, this.sessionId()), eq(se.form, this.formSlug()), eq(se.formVersion, this.formVersion()))))
					.orderBy(({ res }) => res.valueIndex)
					.select(({ res, parentItem }) => ({
						value: res.value,
						parentDataKey: parentItem.config.dataKey,
					}))
				);

				const parentKeys = await findAllParentDataKeys(item.id);
				if (item.acceptsMultipleValues) {
					set(draft, [...parentKeys, item.config.dataKey], response.map(r => r.value));
				} else {
					set(draft, [...parentKeys, item.config.dataKey], response[0]?.value ?? item.config?.defaultValue ?? null);
				}
			}
		}
		this.submissionData.set(finishDraft(draft));
	});
	protected readonly submissionForm = injectForm({
		defaultValues: {} as SubmissionData
	});
	private readonly currentFormState = injectStore(this.submissionForm, identity);
	protected readonly canMergeRemoteChanges = injectStore(this.submissionForm, state => !state.isDirty);
	#mergeRemoteChanges = effect(() => {
		const canProceed = untracked(this.canMergeRemoteChanges);
		if (!canProceed) return;
		const changes = this.submissionData();
		this.submissionForm.reset(changes);
	});
	// #foo
}

async function findAllParentDataKeys(id: string): Promise<string[]> {
	const response = await queryOnce(q => q.from({ fi: formItemsCollection })
		.join(({ parent: formItemsCollection }), ({ fi, parent }) => eq(fi.parentId, parent.id))
		.where(({ fi }) => eq(fi.id, id))
		.select(({ parent }) => ({ dataKey: parent.config.dataKey }))
		.findOne()
	);

	if (!response || !response.dataKey) return Array<string>();

	return [response.dataKey, ...(await findAllParentDataKeys(response.dataKey))];
}
