import { assertInInjectionContext, inject } from "@angular/core";
import { defaultFormItemDefinitionSchemaValue } from "@app/components/form/schema/form-designer-config";
import { PushDocumentChanges } from "@app/store/docs/actions";
import { Store } from "@ngxs/store";
import { and, createOptimisticAction, eq, not, queryOnce } from "@tanstack/db";
import { lastValueFrom } from "rxjs";
import { formItemsCollection, formsCollection, formVersionsCollection } from "./collections";
import { FormItemType, FormSchema, FormVersionSchema } from "./schemas";

export function removeFormItem() {
	assertInInjectionContext(removeFormItem);
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

export function createForm() {
	assertInInjectionContext(createForm);
	const store = inject(Store);
	return createOptimisticAction<{ version: string, title: string, slug: string, description?: string }>({
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
