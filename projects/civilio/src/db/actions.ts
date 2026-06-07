import { assertInInjectionContext, inject } from "@angular/core";
import { PushDocumentChanges } from "@app/store/docs/actions";
import { Store } from "@ngxs/store";
import { createOptimisticAction } from "@tanstack/db";
import { lastValueFrom } from "rxjs";
import { formsCollection, formVersionsCollection } from "./collections";
import { FormSchema, FormVersionSchema } from "./schemas";

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
