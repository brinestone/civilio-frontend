import z from "zod";
import { Archivable, Base } from "./base";

export const FormVersion = Base.extend({
	id: z.uuid(),
	form: z.string(),
	parentId: z.uuid().nullish().default(null),
	isCurrent: z.boolean().default(true),
	label: z.string().trim().nullish().default(null)
}).and(Archivable);
export type FormVersion = z.infer<typeof FormVersion>;

export const Form = Base.extend({
	slug: z.string(),
	description: z.string().trim().nullish().default(null),
	title: z.string(),
	logoUrl: z.string().nullish().default(null),
	archivedAt: z.string().trim().nullish().default(null),
	validationCodes: z.string().array().nullish().default([])
}).and(Archivable);
