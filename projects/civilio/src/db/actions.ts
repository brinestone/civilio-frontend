import { assertInInjectionContext, inject } from "@angular/core";
import { defaultFormItemDefinitionSchemaValue } from "@app/components/form/schema/form-designer-config";
import { PushDocumentChanges } from "@app/store/docs/actions";
import { Store } from "@ngxs/store";
import { createOptimisticAction, eq, inArray, queryOnce } from "@tanstack/db";
import { lastValueFrom } from "rxjs";
import z from "zod";
import { Entity, formItemsCollection, formsCollection, formVersionsCollection } from "./collections";
import { FormItem, FormItemType, FormSchema, FormVersionSchema } from "./schemas";
import omit from 'lodash/omit';
import { removeVirtualProps } from "./utils";
import { deepObjectDiff } from "@civilio/shared";

export const NewFormData = z.object({
	title: z.string('This field is required').default(''),
	description: z.string().nullish().default(null)
});
export type NewFormData = z.output<typeof NewFormData>;
export type NewFormDataInput = z.input<typeof NewFormData>;

export function updateFormItemAction() {
	assertInInjectionContext(updateFormItemAction);
	const store = inject(Store);
	return createOptimisticAction<{
		changes: Entity<FormItem>[]
	}>({
		autoCommit: false,
		onMutate: ({ changes }) => {
			for (const change of changes) {
				formItemsCollection.update(change.id, draft => {
					Object.assign(draft, change);
				});
			}
		},
		mutationFn: async ({ changes }) => {
			const diffs = Array<any>();

			const originals = await queryOnce(q => q.from({ fi: formItemsCollection }).where(({ fi }) => inArray(fi.id, changes.map(c => c.id))).select(({ fi }) => fi));
			for (const change of changes) {
				const diff = deepObjectDiff(removeVirtualProps(change), removeVirtualProps(originals.find(o => o.id === change.id)!));
				if (Object.keys(diff).length > 0) {
					diffs.push({
						...diff,
						$id: change.id
					});
				}
			}
			await lastValueFrom(store.dispatch(new PushDocumentChanges(diffs.map(c => ({
				collection: 'form-items',
				data: omit(c, ['$id']),
				entityKey: c.$id,
				operation: 'update'
			})))));
		}
	})
}

export function removeFormItemAction() {
	assertInInjectionContext(removeFormItemAction);
	const store = inject(Store);
	return createOptimisticAction<{ id: string, formVersion: string }>({
		autoCommit: false,
		onMutate: ({ id }) => {
			formItemsCollection.delete(id);
		},
		mutationFn: async ({ id, formVersion }) => {
			const result = await queryOnce(q => q.from({ fv: formVersionsCollection })
				.where(({ fv }) => eq(fv.id, formVersion))
				// .select(({ fv }) => ({ id: fv.id }))
			);
			await lastValueFrom(store.dispatch(new PushDocumentChanges([
				{
					collection: 'form-items',
					data: {},
					entityKey: id,
					operation: 'delete'
				},
				// ...result.map(i)
			])))
		}
	})
}

export function addFormItem() {
	assertInInjectionContext(addFormItem);
	const store = inject(Store);
	return createOptimisticAction<{ type: FormItemType, path: string; formVersion: string, parentId?: string, id: string }>({
		autoCommit: false,
		onMutate: ({ formVersion, path, parentId, type, id }) => {
			formItemsCollection.insert(defaultFormItemDefinitionSchemaValue(path, id, type, formVersion, parentId))
		},
		mutationFn: async ({ parentId, formVersion, path, type, id }) => {
			await lastValueFrom(store.dispatch(new PushDocumentChanges([
				{
					collection: 'form-items',
					data: defaultFormItemDefinitionSchemaValue(path, id, type, formVersion, parentId),
					entityKey: id,
					operation: 'insert'
				}
			])))
		}
	})
}

export function createFormAction() {
	assertInInjectionContext(createFormAction);
	const store = inject(Store);
	return createOptimisticAction<{ version: string, title: string, slug: string, description?: string | null }>({
		autoCommit: false,
		onMutate: ({ title, slug, version, description }) => {
			const tempSlug = `new_____${slug}`;
			formsCollection.insert({
				slug: tempSlug,
				title,
				description: description ?? null
			});
			formVersionsCollection.insert({
				form: tempSlug,
				id: version,
				isCurrent: true,
			});
		},
		mutationFn: async ({ slug, description, title, version }) => {
			await lastValueFrom(store.dispatch(new PushDocumentChanges([
				{
					collection: 'forms',
					data: FormSchema.parse({ slug, title, description }),
					entityKey: slug,
					operation: 'insert'
				},
				{ collection: 'form-versions', data: FormVersionSchema.parse({ isCurrent: true, form: slug, id: version }), entityKey: version, operation: 'insert' }
			])));
		}
	})
}
