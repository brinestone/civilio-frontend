import z from "zod";
import { FieldKeySchema } from "../field-keys";
import { AppConfigSchema, DbColumnSpecSchema, FieldMappingSchema, FormTypeSchema, LocaleSchema, OptionSchema, ThemeSchema } from "../schema";

export const UpdateLocaleRequestSchema = z.object({
	locale: LocaleSchema
})

export const RemoveFieldMappingResponseSchema = z.boolean();

export const RemoveFieldMappingRequestSchema = z.object({
	form: FormTypeSchema,
	field: FieldKeySchema
});

export const ChangeRequestBaseSchema = z.object({
	form: FormTypeSchema,
	index: z.int().optional()
});

export const DeletionChangeRequestSchema = ChangeRequestBaseSchema.extend({
	index: z.int().array(),
	type: z.literal('delete')
});

export const UpdateChangeRequestSchema = ChangeRequestBaseSchema.extend({
	changes: z.record(FieldKeySchema, z.any()).optional(),
	type: z.literal('update')
})

export const FormSubmissionUpdateRequestSchema = z.discriminatedUnion('type', [
	DeletionChangeRequestSchema,
	UpdateChangeRequestSchema
])

export const UpdateSubmissionFormDataResponseSchema = z.void();

export const SubFormUpdateBaseSchema = z.object({
	parentIndex: z.int(),
	form: FormTypeSchema
});

export const DeletionSubFormUpdateChangeSchema = SubFormUpdateBaseSchema.extend({
	indexes: z.object({ identifierKey: FieldKeySchema, index: z.int() }).array(),
	type: z.literal('delete')
});

export const UpdateSubFormChangeSchema = SubFormUpdateBaseSchema.extend({
	type: z.literal('update'),
	changes: z.object({
		identifier: z.object({
			value: z.int().optional(),
			fieldKey: FieldKeySchema
		}),
		data: z.record(z.string(), z.union([z.string(), z.string().array()]).nullable())
	}).array()
})

export const UpdateSubmissionSubFormDataRequestSchema = z.discriminatedUnion('type', [
	UpdateSubFormChangeSchema,
	DeletionSubFormUpdateChangeSchema
]);

export const UpdateSubmissionSubFormDataResponseSchema = z.void();

export const UpdateThemeRequestSchema = z.object({
	theme: ThemeSchema
})

export const FindIndexSuggestionsRequestSchema = z.object({
	form: FormTypeSchema,
	query: z.string().regex(/^\d+$/)
});

export const FindIndexSuggestionsResponseSchema = z.number().array();

export const GetAutoCompletionSuggestionsRequestSchema = z.object({
	field: FieldKeySchema,
	query: z.string(),
	form: FormTypeSchema,
	resultSize: z.number()
});

export const GetAutoCompletionSuggestionsResponseSchema = z.string().array();

export const FindSubmissionDataRequestSchema = z.object({
	form: FormTypeSchema,
	index: z.number()
});

export const FindSubmissionDataResponseSchema = z.record(z.string(), z.union([
	z.string().nullable(),
	z.string().nullable().array()
])).nullable();

export const FindSubmissionRefRequestSchema = z.object({
	form: FormTypeSchema,
	index: z.int()
});

export const SubmissionRefSchema = z.int().nullable();

export const FindSubmissionRefResponseSchema = z.tuple([
	SubmissionRefSchema.nullable(),
	SubmissionRefSchema.nullable()
]).nullable();

export const LoadTranslationRequestSchema = z.object({
	locale: LocaleSchema
});

const strictTranslationBaseSchema = z.union([
	z.string(),
	z.string().array(),
	z.undefined(),
	z.null()
]);
const TranslationObjectSchema: z.ZodSchema = z.lazy(() => {
	return z.record(z.string(), z.union([
		strictTranslationBaseSchema,
		TranslationObjectSchema
	]))
});
const StrictTranslationSchema = z.union([strictTranslationBaseSchema, TranslationObjectSchema])
const TranslationSchema = z.union([
	StrictTranslationSchema,
	z.any()
]);

export const LoadTranslationResponseSchema = TranslationSchema;
export const TestDbConnectionResponseSchema = z.union([z.literal(true), z.string()]);

export const TestDbConnectionRequestSchema = z.object({
	host: z.string(),
	port: z.coerce.number(),
	database: z.string(),
	username: z.string(),
	password: z.string(),
	ssl: z.boolean().optional().default(false)
});
export const UpdateConfigRequestSchema = z.object({
	path: z.string(),
	value: z.unknown().nullable()
});
export const AppConfigResponseSchema = AppConfigSchema;
export const FieldMappingRequestSchema = z.object({
	form: FormTypeSchema,
	field: FieldKeySchema,
	i18nKey: z.string(),
	dbColumn: z.string().nullable()
});
export const FieldUpdateSpecSchema = FieldMappingRequestSchema.pick({
	field: true,
	dbColumn: true
}).extend({
	table: z.string()
}).required();
export const UpdateFieldMappingRequestSchema = z.object({
	updates: FieldUpdateSpecSchema.array(),
	form: FormTypeSchema
});

export const FindFieldMappingsRequestSchema = z.object({
	form: FormTypeSchema
});
export const FindFieldMappingsResponseSchema = FieldMappingSchema.array();
export const FindDbColumnsRequestSchema = FindFieldMappingsRequestSchema;
export const FindDbColumnsResponseSchema = DbColumnSpecSchema.array();
export const FindFormOptionsRequestSchema = FindFieldMappingsRequestSchema;
export const FindFormOptionsResponseSchema = z.record(z.string(), OptionSchema.array());
export const FindFormSubmissionsRequestSchema = z.object({
	form: FormTypeSchema,
	page: z.number(),
	size: z.number(),
	filter: z.string().optional()
});

export type FindFieldMappingsRequest = z.infer<typeof FindFieldMappingsRequestSchema>;
export type FieldMappingRequest = z.infer<typeof FieldMappingRequestSchema>;
export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;
export type AppConfigResponse = z.infer<typeof AppConfigResponseSchema>;
export type FindFormOptionsResponse = z.infer<typeof FindFormOptionsResponseSchema>;
export type TestDbConnectionRequest = z.infer<typeof TestDbConnectionRequestSchema>;
export type TestDbConnectionResponse = z.infer<typeof TestDbConnectionResponseSchema>;
export type LoadTranslationRequest = z.input<typeof LoadTranslationRequestSchema>;
export type LoadTranslationResponse = z.output<typeof LoadTranslationResponseSchema>;
export type FindDbColumnsResponse = z.infer<typeof FindDbColumnsResponseSchema>;
export type UpdateFieldMappingRequest = z.infer<typeof UpdateFieldMappingRequestSchema>;
export type FieldUpdateSpec = z.output<typeof FieldUpdateSpecSchema>;
export type FindSubmissionDataResponse = z.output<typeof FindSubmissionDataResponseSchema>;
export type FindFieldMappingsResponse = z.output<typeof FindFieldMappingsResponseSchema>;
export type GetAutoCompletionSuggestionsRequest = z.infer<typeof GetAutoCompletionSuggestionsRequestSchema>;
export type GetAutoCompletionSuggestionsResponse = z.infer<typeof GetAutoCompletionSuggestionsResponseSchema>;
export type FindSubmissionRefRequest = z.output<typeof FindSubmissionRefRequestSchema>;
export type FindSubmissionRefResponse = z.output<typeof FindSubmissionRefResponseSchema>;
export type FindIndexSuggestionsRequest = z.output<typeof FindIndexSuggestionsRequestSchema>;
export type FindIndexSuggestionsResponse = z.output<typeof FindIndexSuggestionsResponseSchema>;
export type FormSubmissionUpdateRequest = z.output<typeof FormSubmissionUpdateRequestSchema>;
export type UpdateSubmissionFormDataResponse = z.output<typeof UpdateSubmissionFormDataResponseSchema>;
export type UpdateSubmissionSubFormDataRequest = z.output<typeof UpdateSubmissionSubFormDataRequestSchema>;
export type UpdateSubmissionSubFormDataResponse = z.output<typeof UpdateSubmissionSubFormDataResponseSchema>;
export type RemoveFieldMappingRequest = z.output<typeof RemoveFieldMappingRequestSchema>;
export type RemoveFieldMappingResponse = z.output<typeof RemoveFieldMappingResponseSchema>;
export type FindFormSubmissionsRequest = z.output<typeof FindFormSubmissionsRequestSchema>;
