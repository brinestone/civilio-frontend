import z from "zod";
export const Base = z.object({
	createdAt: z.string().trim().nullish().default(new Date().toISOString()),
	updatedAt: z.string().trim().nullish().default(new Date().toISOString()),
});
export const Archivable = z.object({
	archivedAt: z.string().trim().nullish().default(null)
});
