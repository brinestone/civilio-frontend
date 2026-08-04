import { assertInInjectionContext, inject } from "@angular/core";
import { defaultFormItemDefinitionSchemaValue } from "@app/components/form/design/form-designer-config";
import { PullChanges, PushDocumentChanges } from "@app/store/docs/actions";
import { PushDocumentChange, SubmissionData } from "@civilio/sdk/models";
import { deepObjectDiff } from "@civilio/shared";
import { Store } from "@ngxs/store";
import { add, coalesce, createOptimisticAction, eq, max, queryOnce } from "@tanstack/db";
import { isObject } from "lodash";
import omit from "lodash/omit";
import { lastValueFrom } from "rxjs";
import z from "zod";
import {
	formItemsCollection,
	formsCollection,
	formVersionsCollection,
	responseCollection,
	responseSessionsCollection
} from "./collections";
import {
	Form,
	FormItemType,
	FormVersion,
	SubmissionResponse
} from "./schemas";
import { FormItemEntity } from "./types";
import { removeVirtualProps } from "./utils";

export const NewFormData = z.object({
	title: z.string("This field is required").default(""),
	description: z.string().nullish().default(null),
});
export type NewFormData = z.output<typeof NewFormData>;
export type NewFormDataInput = z.input<typeof NewFormData>;

export function createSubmissionSessionAction() {
	assertInInjectionContext(createSubmissionSessionAction);
	const store = inject(Store);
	return createOptimisticAction<{
		index?: number;
		formSlug: string;
		changeNotes?: string | null;
		data: SubmissionData;
		formVersion: string;
		sessionId: string;
		dataKeyMap: Map<string, string>;
	}>({
		autoCommit: false,
		onMutate: (params) => {
			let index = params.index;
			if (index === undefined || isNaN(index)) {
				index = Date.now();
			}
			const changes = extractChangesFromSubmissionData(params.data, params.formVersion, params.sessionId, params.dataKeyMap);
			responseSessionsCollection.insert({
				form: params.formSlug,
				formVersion: params.formVersion,
				id: params.sessionId,
				index,
				changeNotes: params.changeNotes
			});

			for (const change of changes) {
				responseCollection.insert(SubmissionResponse.parse(change.data), { optimistic: true });
			}
		},
		mutationFn: async (params) => {
			await lastValueFrom(store.dispatch(PullChanges));
			let index = params.index;
			if (index === undefined || isNaN(index)) {
				const res = await queryOnce(q => q.from({ response: responseSessionsCollection })
					.where(({ response }) => eq(response.formVersion, params.formVersion))
					.select(({ response }) => ({ nextIndex: coalesce(add(max(response.index), 1), 1) }))
					.findOne()
				);

				index = res?.nextIndex ?? 1;
			}

			const changes = Array<PushDocumentChange>();

			changes.push({
				collection: 'response-sessions',
				operation: 'insert',
				entityKey: params.sessionId,
				data: {
					id: params.sessionId,
					index,
					changeNotes: params.changeNotes,
					form: params.formSlug,
					formVersion: params.formVersion
				}
			});

			const extracted = extractChangesFromSubmissionData(params.data, params.formVersion, params.sessionId, params.dataKeyMap);
			changes.push(...extracted);

			await lastValueFrom(store.dispatch(new PushDocumentChanges(changes)));
		}
	})
}

function extractChangesFromSubmissionData(data: SubmissionData, formVersion: string, sessionId: string, lookupTable: Map<string, string>): PushDocumentChange[] {
	const changes = Array<PushDocumentChange>();
	for (const [key, value] of Object.entries(data)) {
		const changeId = crypto.randomUUID();
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
			const formItemId = lookupTable.get(key);
			if (!formItemId) throw new Error(`Form item not found with data key: ${key}`);
			if (!Array.isArray(value)) {
				changes.push({
					collection: 'form-responses',
					operation: 'insert',
					entityKey: changeId,
					data: {
						id: changeId,
						value,
						sessionId: sessionId,
						valueIndex: 1,
						formItem: formItemId
					}
				})
			} else {
				changes.push(...value.map((v, i) => {
					const changeId = crypto.randomUUID();
					return ({
						collection: 'form-responses',
						operation: 'insert',
						entityKey: changeId,
						data: {
							id: changeId,
							value: v,
							sessionId: sessionId,
							valueIndex: i,
							formItem: formItemId
						}
					}) as PushDocumentChange;
				}))
			}
		} else if (isObject(value)) {
			changes.push(...(extractChangesFromSubmissionData(value as SubmissionData, formVersion, sessionId, lookupTable)));
		}
	}
	return changes;
}

export function updateFormItemAction() {
	assertInInjectionContext(updateFormItemAction);
	const store = inject(Store);
	return createOptimisticAction<{
		changes: {
			pristine: FormItemEntity;
			change: any;
		}[];
	}>({
		autoCommit: false,
		onMutate: ({ changes }) => {
			for (const { pristine, change } of changes) {
				formItemsCollection.update(pristine.id, (draft) => {
					Object.assign(draft, change);
				});
			}
		},
		mutationFn: async ({ changes }) => {
			const diffs = Array<any>();
			for (const { change, pristine } of changes) {
				const diff = deepObjectDiff(
					removeVirtualProps(pristine),
					removeVirtualProps(change),
				);

				if (Object.keys(diff).length > 0) {
					diffs.push({ ...diff, $id: pristine.id });
				}
			}

			await lastValueFrom(store.dispatch(new PushDocumentChanges(diffs.map(diff => ({
				collection: 'form-items',
				data: omit(diff, '$id'),
				entityKey: diff.$id,
				operation: 'update'
			})))));
		},
	});
}

export function removeFormItemAction() {
	assertInInjectionContext(removeFormItemAction);
	const store = inject(Store);
	return createOptimisticAction<{ id: string; formVersion: string }>({
		autoCommit: false,
		onMutate: ({ id }) => {
			formItemsCollection.delete(id);
		},
		mutationFn: async ({ id }) => {
			await lastValueFrom(
				store.dispatch(
					new PushDocumentChanges([
						{
							collection: "form-items",
							data: {},
							entityKey: id,
							operation: "delete",
						},
						// ...result.map(i)
					]),
				),
			);
		},
	});
}

export function createFormItemAction() {
	assertInInjectionContext(createFormItemAction);
	const store = inject(Store);
	return createOptimisticAction<{
		type: FormItemType;
		path: string;
		formVersion: string;
		parentId?: string;
		id: string;
	}>({
		autoCommit: false,
		onMutate: ({ formVersion, path, parentId, type, id }) => {
			formItemsCollection.insert(
				defaultFormItemDefinitionSchemaValue(
					path,
					id,
					type,
					formVersion,
					parentId,
				),
			);
		},
		mutationFn: async ({ parentId, formVersion, path, type, id }) => {
			await lastValueFrom(
				store.dispatch(
					new PushDocumentChanges([
						{
							collection: "form-items",
							data: defaultFormItemDefinitionSchemaValue(
								path,
								id,
								type,
								formVersion,
								parentId,
							),
							entityKey: id,
							operation: "insert",
						},
					]),
				),
			);
		},
	});
}

export function createFormAction() {
	assertInInjectionContext(createFormAction);
	const store = inject(Store);
	return createOptimisticAction<{
		version: string;
		title: string;
		slug: string;
		description?: string | null;
	}>({
		autoCommit: false,
		onMutate: ({ title, slug, version, description }) => {
			const tempSlug = `new_____${slug}`;
			formsCollection.insert({
				slug: tempSlug,
				title,
				description: description ?? null,
			});
			formVersionsCollection.insert({
				form: tempSlug,
				id: version,
				isCurrent: true,
			});
		},
		mutationFn: async ({ slug, description, title, version }) => {
			await lastValueFrom(
				store.dispatch(
					new PushDocumentChanges([
						{
							collection: "forms",
							data: Form.parse({ slug, title, description }),
							entityKey: slug,
							operation: "insert",
						},
						{
							collection: "form-versions",
							data: FormVersion.parse({
								isCurrent: true,
								form: slug,
								id: version,
							}),
							entityKey: version,
							operation: "insert",
						},
					]),
				),
			);
		},
	});
}
