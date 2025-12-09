import z from "zod";
import { FieldKeySchema } from "../field-keys";
import {
	AppConfigSchema,
	DbColumnSpecSchema,
	DbConnectionRefInputSchema,
	DbConnectionRefSchema,
	FieldMappingSchema,
	FormSubmissionSchema,
	FormTypeSchema,
	LocaleSchema,
	MigrationsCheckReportSchema,
	OptionSchema,
	SubmissionChangeDeltaSchema,
	SubmissionVersionInfoSchema,
	ThemeSchema
} from "../schema";

export const UseConnectionRequestSchema = z.coerce.number();
export const DeleteDbConnectionRequestSchema = z.coerce.number();
export const AddDbConnectionRequestSchema = DbConnectionRefInputSchema;
export const FindConnectionHistoryResponseSchema = DbConnectionRefSchema.array();

export const ApplyPendingMigrationsResponseSchema = MigrationsCheckReportSchema;
export const CheckMigrationsResponseSchema = MigrationsCheckReportSchema;

export const VersionRevertResponseSchema = z.void();
export const VersionRevertRequestSchema = z.object({
	index: z.coerce.number(),
	form: FormTypeSchema,
	targetVersion: z.string(),
	customVersion: z.string().optional(),
	changeNotes: z.string()
})

export const UpdateSubmissionResponseSchema = z.void();
export const UpdateSubmissionRequestSchema = z.object({
	deltas: SubmissionChangeDeltaSchema.array(),
	form: FormTypeSchema,
	changeNotes: z.string(),
	parentVersion: z.string().nullable().optional(),
	submissionIndex: z.coerce.number().optional(),
	customVersion: z.string().optional()
});
export const SubmissionRefSchema = FormSubmissionSchema.pick({
	facilityName: true,
	index: true
}).nullable();
export const FindSubmissionRefSuggestionsRequestSchema = z.object({
	form: FormTypeSchema,
	query: z.string()
});
export const FindSubmissionRefSuggestionsResponseSchema = SubmissionRefSchema.array();
export const InitializeSubmissionVersionResponseSchema = z.string().nullable();
export const InitializeSubmissionVersionRequestSchema = z.object({
	index: z.coerce.number(),
	form: FormTypeSchema,
});
export const FindSubmissionCurrentVersionResponseSchema = SubmissionVersionInfoSchema.nullable();
export const FindSubmissionCurrentVersionRequestSchema = z.object({
	form: FormTypeSchema,
	index: z.coerce.number()
});
export const FindSubmissionVersionsResponseSchema = SubmissionVersionInfoSchema.array();
export const FindSubmissionVersionsRequestSchema = z.object({
	form: FormTypeSchema,
	index: z.coerce.number(),
	changeOffset: z.date().optional(),
	limit: z.number().optional().default(50),
});
export const UpdateLocaleRequestSchema = z.object({
	locale: LocaleSchema
});
export const RemoveFieldMappingResponseSchema = z.boolean();
export const RemoveFieldMappingRequestSchema = z.object({
	form: FormTypeSchema,
	field: FieldKeySchema
});
export const ChangeRequestBaseSchema = z.object({
	form: FormTypeSchema,
	index: z.int().optional()
});
export const UpdateSubmissionFormDataResponseSchema = z.void();
export const UpdateThemeRequestSchema = z.object({
	theme: ThemeSchema
});
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
	index: z.number(),
	version: z.string().optional()
});
export const FindSubmissionDataResponseSchema = z.record(z.string(), z.union([
	z.string().nullable(),
	z.coerce.string().nullable().array()
])).nullable();
export const FindSubmissionRefRequestSchema = z.object({
	form: FormTypeSchema,
	index: z.coerce.number()
});
export const FindSubmissionRefResponseSchema = z.tuple([
	z.int().nullable(),
	z.int().nullable()
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
export type FindFieldMappingsRequest = z.input<typeof FindFieldMappingsRequestSchema>;
export type FieldMappingRequest = z.input<typeof FieldMappingRequestSchema>;
export type UpdateConfigRequest = z.input<typeof UpdateConfigRequestSchema>;
export type AppConfigResponse = z.infer<typeof AppConfigResponseSchema>;
export type FindFormOptionsResponse = z.infer<typeof FindFormOptionsResponseSchema>;
export type TestDbConnectionRequest = z.input<typeof TestDbConnectionRequestSchema>;
export type TestDbConnectionResponse = z.infer<typeof TestDbConnectionResponseSchema>;
export type LoadTranslationRequest = z.input<typeof LoadTranslationRequestSchema>;
export type LoadTranslationResponse = z.output<typeof LoadTranslationResponseSchema>;
export type FindDbColumnsResponse = z.infer<typeof FindDbColumnsResponseSchema>;
export type UpdateFieldMappingRequest = z.input<typeof UpdateFieldMappingRequestSchema>;
export type FieldUpdateSpec = z.output<typeof FieldUpdateSpecSchema>;
export type FindSubmissionDataRequest = z.input<typeof FindSubmissionDataRequestSchema>;
export type FindSubmissionDataResponse = z.output<typeof FindSubmissionDataResponseSchema>;
export type FindFieldMappingsResponse = z.output<typeof FindFieldMappingsResponseSchema>;
export type GetAutoCompletionSuggestionsRequest = z.input<typeof GetAutoCompletionSuggestionsRequestSchema>;
export type GetAutoCompletionSuggestionsResponse = z.infer<typeof GetAutoCompletionSuggestionsResponseSchema>;
export type FindSubmissionRefRequest = z.input<typeof FindSubmissionRefRequestSchema>;
export type FindSubmissionRefResponse = z.output<typeof FindSubmissionRefResponseSchema>;
export type FindIndexSuggestionsRequest = z.input<typeof FindIndexSuggestionsRequestSchema>;
export type FindIndexSuggestionsResponse = z.output<typeof FindIndexSuggestionsResponseSchema>;
export type UpdateSubmissionRequest = z.input<typeof UpdateSubmissionRequestSchema>;
export type UpdateSubmissionResponse = z.output<typeof UpdateSubmissionResponseSchema>;
export type RemoveFieldMappingRequest = z.input<typeof RemoveFieldMappingRequestSchema>;
export type RemoveFieldMappingResponse = z.output<typeof RemoveFieldMappingResponseSchema>;
export type FindFormSubmissionsRequest = z.input<typeof FindFormSubmissionsRequestSchema>;
export type FindSubmissionVersionsRequest = z.input<typeof FindSubmissionVersionsRequestSchema>;
export type FindSubmissionVersionsResponse = z.output<typeof FindSubmissionVersionsResponseSchema>;
export type FindSubmissionCurrentVersionRequest = z.input<typeof FindSubmissionCurrentVersionRequestSchema>;
export type FindSubmissionCurrentVersionResponse = z.output<typeof FindSubmissionCurrentVersionResponseSchema>;
export type InitializeSubmissionVersionResponse = z.infer<typeof InitializeSubmissionVersionResponseSchema>;
export type InitializeSubmissionVersionRequest = z.input<typeof InitializeSubmissionVersionRequestSchema>;
export type FindSubmissionRefSuggestionsResponse = z.output<typeof FindSubmissionRefSuggestionsResponseSchema>;
export type FindSubmissionRefSuggestionsRequest = z.input<typeof FindSubmissionRefSuggestionsRequestSchema>;
export type VersionRevertRequest = z.input<typeof VersionRevertRequestSchema>;
export type VersionRevertResponse = z.output<typeof VersionRevertResponseSchema>;
export type CheckMigrationsResponse = z.output<typeof CheckMigrationsResponseSchema>;
export type ApplyPendingMigrationsResponse = z.output<typeof ApplyPendingMigrationsResponseSchema>;
export type FindConnectionHistoryResponse = z.output<typeof FindConnectionHistoryResponseSchema>;
export type DeleteDbConnectionRequest = z.input<typeof DeleteDbConnectionRequestSchema>;
export type AddDbConnectionRequest = z.input<typeof AddDbConnectionRequestSchema>;
export type UseConnectionRequest = z.input<typeof UseConnectionRequestSchema>;
