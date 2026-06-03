import z from "zod";

export const BaseSchema = z.object({
	createdAt: z.string().nullish().default(new Date().toISOString()),
	updatedAt: z.string().nullish().default(new Date().toISOString()),
});
export const Archivable = z.object({
	archivedAt: z.string().nullish().default(null)
})

export const FormVersionSchema = BaseSchema.extend({
	id: z.uuid(),
	form: z.string(),
	parentId: z.uuid().nullish().default(null),
	isCurrent: z.boolean().default(true),
}).and(Archivable);

export const FormSchema = BaseSchema.extend({
	slug: z.string(),
	description: z.string().nullish().default(null),
	title: z.string(),
	archivedAt: z.string().nullish().default(null),
}).and(Archivable);
