import z from "zod";

export const FormVersionSchema = z.object({
	id: z.uuid(),
	form: z.string(),
	createdAt: z.iso.date().nullish(),
	updatedAt: z.iso.date().nullish(),
	parentId: z.uuid().nullish().default(null),
	isCurrent: z.boolean().default(true),
	archivedAt: z.iso.date().nullish()
});

export const FormSchema = z.object({
	slug: z.string(),
	description: z.string().nullish().default(null),
	title: z.string(),
	lastUpdated: z.iso.date().nullish(),
	createdAt: z.iso.date().nullish()
})
