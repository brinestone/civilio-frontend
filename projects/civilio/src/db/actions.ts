import { assertInInjectionContext, inject } from "@angular/core";
import { DocumentsService } from "@civilio/sdk/services/documents/documents.service";
import { createOptimisticAction } from "@tanstack/db";
import { lastValueFrom } from "rxjs";
import { formsCollection, formVersionsCollection } from "./collections";
import { groupBy } from "lodash";
import { FormSchema, FormVersionSchema } from "./schemas";

export function createForm() {
	assertInInjectionContext(createForm);
	const docsService = inject(DocumentsService);
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
			const now = new Date();
			const result = await lastValueFrom(
				docsService.pushDocumentChanges([
					{
						collection: 'forms',
						data: FormSchema.parse({ slug, title, description }),
						entityKey: slug,
						operation: 'insert'
					},
					{
						collection: 'form-versions',
						data: FormVersionSchema.parse({ isCurrent: true, form: slug, id: version, createdAt: now.toISOString(), updatedAt: now.toISOString() }),
						entityKey: version,
						operation: 'insert'
					}
				])
			);
			const groups = groupBy(result, 'collection');
			formsCollection.utils['bulkInsertLocally'](groups['forms'].map(e => e.data));
			formVersionsCollection.utils['bulkInsertLocally'](groups['form-versions'].map(e => e.data));
		}
	})
}
