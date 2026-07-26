import z from "zod";
import { Archivable, Base } from "./base";

export const ResponseSession = Base.extend({
	id: z.uuid(),
	index: z.number(),
	label: z.string().trim().nullish().default(new Date().toString()),
	form: z.string(),
	formVersion: z.string(),
}).and(Archivable);
export type ResponseSession = z.infer<typeof ResponseSession>;
export const SubmissionResponse = z.object({
	id: z.uuid(),
	value: z.any().nullable().default(null),
	sessionId: z.uuid(),
	parentId: z.uuid().nullish().default(null),
	valueIndex: z.number().positive('Index must be a positive number').nullish().default(0),
	formItem: z.uuid()
}).and(Archivable);
export type SubmissionResponse = z.infer<typeof SubmissionResponse>;
