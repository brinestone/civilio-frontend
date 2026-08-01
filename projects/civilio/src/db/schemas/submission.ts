import z from "zod";
import { Archivable, Base } from "./base";

export const ResponseSession = Base.extend({
	id: z.uuid(),
	index: z.number(),
	changeNotes: z.string().trim().nullish().default(new Date().toString()),
	form: z.string(),
	formVersion: z.string(),
}).and(Archivable);
export type ResponseSession = z.infer<typeof ResponseSession>;
export const SubmissionResponse = z.object({
	id: z.string().transform(s => s.split('|')[0]).pipe(z.uuid()),
	value: z.any().nullable().default(null),
	sessionId: z.uuid(),
	parentId: z.uuid().nullish().default(null),
	valueIndex: z.number().min(0, 'Value must be a zero-based index value').nullish().default(0),
	formItem: z.uuid()
}).and(Archivable);
export type SubmissionResponse = z.infer<typeof SubmissionResponse>;
