import { Listbox, Option } from '@angular/aria/listbox';
import { NumberInput } from "@angular/cdk/coercion";
import { DecimalPipe, NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	effect,
	inject,
	input,
	linkedSignal,
	numberAttribute,
	resource,
	signal,
	untracked
} from "@angular/core";
import { form, metadata, required } from "@angular/forms/signals";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { HINT } from "@app/components/form/design/form-designer-config";
import { FormRenderer } from '@app/components/form/render';
import { RelativeDatePipe } from "@app/pipes";
import { SubmissionData } from "@civilio/sdk/models";
import { createSubmissionSessionAction } from "@db/actions";
import { formItemsCollection, formsCollection, formVersionsCollection, responseCollection, responseSessionsCollection } from "@db/collections";
import { QuestionItemEntity } from "@db/types";
import { findAllParentDataKeys } from "@db/utils";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle } from "@ng-icons/lucide";
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { BrnSheetImports } from "@spartan-ng/brain/sheet";
import { HlmAlertImports } from "@spartan-ng/helm/alert";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmField, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSheetImports } from "@spartan-ng/helm/sheet";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { injectLiveQuery } from "@tanstack/angular-db";
import { and, count, eq, inArray, isNull, max, queryOnce } from "@tanstack/db";
import { createDraft, finishDraft } from "immer";
import set from 'lodash/set';
import { injectQueryParams } from "ngxtension/inject-query-params";

type SubmissionMetaData = {
	// index: number | null;
	changeNotes: string;
	validationCode: string;
}

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
		HlmSheetImports,
		BrnSheetImports,
		NgIcon,
		DecimalPipe,
		HlmFieldLabel,
		RouterLinkActive,
		NgTemplateOutlet,
		HlmSkeleton,
		RelativeDatePipe,
		RouterLink,
		FormRenderer,
		Listbox,
		Option,
		HlmField,
	],
})
export class SubmissionDataPage {
	readonly index = input<number | undefined, NumberInput>(undefined, {
		transform: numberAttribute,
	});
	readonly formVersionArg = input<string>(undefined, { alias: 'version' })
	readonly formSlug = input<string>(undefined, { alias: "slug" });
	private readonly _sessionId = injectQueryParams('session', { defaultValue: newSessionId() });
	private readonly sessionId = linkedSignal(() => this._sessionId());

	protected readonly submissionMetaFormData = signal<SubmissionMetaData>({
		changeNotes: '',
		validationCode: ''
	});
	protected readonly submissionMetaForm = form(this.submissionMetaFormData, paths => {
		required(paths.validationCode, { message: 'A value is required' });
		metadata(paths.changeNotes, HINT, () => 'A note describing the changes made');
	});

	protected readonly pageRoute = inject(ActivatedRoute);
	protected readonly formVersion = linkedSignal(() => this.formVersionArg());
	protected readonly submissionMetaSheetState = signal<BrnDialogState>('open');
	protected readonly submissionData = signal<Record<string, unknown>>({});
	protected readonly isNew = computed(() => this.index() === undefined || isNaN(Number(this.index())));
	protected readonly pageIndex = signal<number>(0);
	protected readonly pageSize = signal<number>(100);
	protected readonly formInfo = injectLiveQuery({
		params: () => ({ slug: this.formSlug() }),
		query: ({ q, params: { slug } }) => q.from({ form: formsCollection })
			.where(({ form }) => eq(form.slug, slug))
			.select(({ form }) => ({ logo: form.logoUrl, title: form.title, description: form.description }))
			.findOne()
	})
	protected readonly formDefinition = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), version: this.formVersion() }),
		query: ({ q, params: { slug, version } }) => q.from({
			fi: formItemsCollection,
		}).innerJoin({ fv: formVersionsCollection }, ({ fi, fv }) => eq(fi.formVersion, fv.id))
			.where(({ fv }) => and(eq(fv.form, slug), version ? eq(fv.id, version) : eq(fv.isCurrent, true)))
			.orderBy(({ fi }) => fi.path, 'asc')
			.select(({ fi }) => fi)
	});
	protected readonly formVersions = resource({
		params: () => ({
			slug: this.formSlug(),
			pagination: {
				pageIndex: Math.max(0, this.pageIndex() - 1),
				pageSize: this.pageSize()
			}
		}),
		defaultValue: [],
		loader: async ({ params }) => {
			return await queryOnce(q => q
				.from({ fv: formVersionsCollection })
				.where(({ fv }) => eq(fv.form, params.slug))
				.limit(params.pagination.pageSize)
				.orderBy(({ fv }) => fv.updatedAt, "desc")
				.offset(params.pagination.pageIndex * params.pagination.pageSize));
		}
	});
	protected readonly submissions = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), index: this.index(), fv: this.formVersion() }),
		query: ({ q, params }) =>
			q
				.from({ sessions: responseSessionsCollection })
				.where(
					({ sessions }) => and(
						eq(sessions.form, params.slug),
						eq(sessions.formVersion, params.fv),
						isNull(sessions.archivedAt)
					),
				).groupBy(({ sessions }) => [sessions.index, sessions.createdAt])
				.select(({ sessions }) => ({
					index: sessions.index,
					recordedAt: sessions.createdAt,
					vc: count(sessions),
					lastUpdated: max(sessions.createdAt)
				}))
				.orderBy(({ $selected }) => $selected.lastUpdated, { direction: 'desc' }),
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
		const index = this.index();
		const sessionId = this.sessionId();
		const formId = this.formSlug();
		const formVersion = this.formVersion();
		const isNew = untracked(this.isNew);
		for (const item of questions) {
			const response = isNew ? [] : await queryOnce(q => q.from({ res: responseCollection })
				.join({ fi: formItemsCollection }, ({ res, fi }) => eq(fi.id, res.formItem))
				.join({ se: responseSessionsCollection }, ({ res, se }) => eq(se.id, res.sessionId))
				.leftJoin({ parentItem: formItemsCollection }, ({ parentItem, fi }) => eq(parentItem.id, fi.parentId))
				.where(({ res, se }) => {
					const clauses = [
						eq(res.formItem, item.id),
						eq(se.form, formId),
						eq(se.formVersion, formVersion)
					];
					if (sessionId)
						clauses.push(eq(se.id, sessionId));
					else {

					}
					return and(eq(res.formItem, item.id), eq(se.id, sessionId), eq(se.form, formId), eq(se.formVersion, formVersion));
				})
				.orderBy(({ res }) => res.valueIndex)
				.select(({ res, parentItem }) => ({
					value: res.value,
					parentDataKey: parentItem.config.dataKey,
				}))
			);

			const parentKeys = await findAllParentDataKeys(item.id);
			if (item.acceptsMultipleValues) {
				set(draft, [...parentKeys, item.config.dataKey], isNew ? [] : response.map(r => r.value ?? item.config?.defaultValue ?? null));
			} else {
				set(draft, [...parentKeys, item.config.dataKey], isNew ? (item.config.defaultValue ?? null) : response[0]?.value ?? item.config?.defaultValue ?? null);
			}
		}
		this.submissionData.set(finishDraft(draft));
	});
	private readonly persistSubmissionChanges = createSubmissionSessionAction();
	protected async handleSubmission(data: SubmissionData) {
		try {
			const items = await queryOnce(q => q.from({ fi: formItemsCollection })
				.where(({ fi }) => and(inArray(fi.type, ['question', 'section']), eq(fi.formVersion, this.formVersion())))
				.select(({ fi }) => ({ id: fi.id, dataKey: fi.config.dataKey })));
			const map = new Map<string, string>(items.map(i => ([i.dataKey, i.id])));
			const lastIndex = await queryOnce(q => q.from({ session: responseSessionsCollection })
				.where(({ session }) => eq(session.form, this.formSlug()))
				.select(({ session }) => ({ index: max(session.index) }))
				.findOne()
			);
			let index: number;
			// const index = isNaN(Number(this.index())) ? (lastIndex?.index ?? 1) : this.index();
			if (this.isNew()) index = (lastIndex?.index ?? 0) + 1;
			else {
				index = Number(this.index() ?? lastIndex?.index);
				index = (isNaN(index) ? 0 : index) + 1;
			}
			const tx = this.persistSubmissionChanges({
				data,
				formSlug: this.formSlug()!,
				formVersion: this.formVersion()!,
				sessionId: this.sessionId()!,
				index,
				dataKeyMap: map
			});

			const task = tx.commit();
			await task;
			// TODO: reset form, update session id to new
		} catch (e) {
			console.error(e);
		}
	}
	private readonly navigate = dispatch(Navigate)
	protected onIndexChanged(index: number) {
		if (index === undefined) return;
		this.navigate(['..', index], { session: 'current' }, { relativeTo: this.pageRoute, queryParamsHandling: 'merge' }).subscribe();
	}
}
