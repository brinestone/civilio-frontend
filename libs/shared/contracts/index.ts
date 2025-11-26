import z from 'zod';
import {
	AppConfigResponseSchema,
	FieldMappingRequestSchema,
	FindDbColumnsRequestSchema,
	FindDbColumnsResponseSchema,
	FindFieldMappingsRequestSchema,
	FindFieldMappingsResponseSchema,
	FindFormOptionsRequestSchema,
	FindFormOptionsResponseSchema,
	FindFormSubmissionsRequestSchema,
	FindIndexSuggestionsResponseSchema,
	FindSubmissionCurrentVersionRequestSchema,
	FindSubmissionCurrentVersionResponseSchema,
	FindSubmissionDataRequestSchema,
	FindSubmissionDataResponseSchema,
	FindSubmissionRefRequestSchema,
	FindSubmissionRefResponseSchema,
	FindSubmissionRefSuggestionsRequestSchema,
	FindSubmissionVersionsRequestSchema,
	FindSubmissionVersionsResponseSchema,
	GetAutoCompletionSuggestionsRequestSchema,
	GetAutoCompletionSuggestionsResponseSchema,
	InitializeSubmissionVersionRequestSchema,
	InitializeSubmissionVersionResponseSchema,
	LoadTranslationRequestSchema,
	LoadTranslationResponseSchema,
	RemoveFieldMappingRequestSchema,
	RemoveFieldMappingResponseSchema,
	TestDbConnectionRequestSchema,
	TestDbConnectionResponseSchema,
	UpdateConfigRequestSchema,
	UpdateFieldMappingRequestSchema,
	UpdateLocaleRequestSchema,
	UpdateSubmissionRequestSchema,
	UpdateSubmissionResponseSchema,
	UpdateThemeRequestSchema,
	VersionRevertRequestSchema, VersionRevertResponseSchema
} from '../dto';
import {
	createPaginatedResultSchema,
	FieldMappingSchema,
	FormSubmissionSchema
} from '../schema';

const entities = z.enum(['field-mappings', 'config', 'submissions',]);
const crudActions = z.enum(['create', 'read', 'update', 'delete']);
export const ChannelSchema = z.templateLiteral([
	entities, ':', crudActions
]);
export const PushEventSchema = z.enum([
	'i18n:update'
]);
export const channelArgs = {
	'field-mappings:create': FieldMappingRequestSchema,
	'field-mappings:read': FindFieldMappingsRequestSchema,
	'field-mappings:update': UpdateFieldMappingRequestSchema,
	'field-mappings:delete': {},
	'config:read': {},
	'columns:read': FindDbColumnsRequestSchema,
	'config:create': {},
	'config:update': UpdateConfigRequestSchema,
	'config:delete': {},
	'submissions:create': {},
	'options:read': FindFormOptionsRequestSchema,
	'submissions:read': FindFormSubmissionsRequestSchema,
	'submissions:update': {},
	'submissions:delete': {},
	'db:test': TestDbConnectionRequestSchema,
	'translations:read': LoadTranslationRequestSchema,
	'submission-data:read': FindSubmissionDataRequestSchema,
	'suggestions:read': GetAutoCompletionSuggestionsRequestSchema,
	'submission-ref:read': FindSubmissionRefRequestSchema,
	'index-suggestions:read': FindSubmissionRefSuggestionsRequestSchema,
	'theme:update': UpdateThemeRequestSchema,
	'resource:read': z.string(),
	'submission-data:update': UpdateSubmissionRequestSchema,
	'field-mapping:clear': RemoveFieldMappingRequestSchema,
	'locale:update': UpdateLocaleRequestSchema,
	'submission-versions:read': FindSubmissionVersionsRequestSchema,
	'submission-version:read': FindSubmissionCurrentVersionRequestSchema,
	'submission-version:init': InitializeSubmissionVersionRequestSchema,
	'submission:revert': VersionRevertRequestSchema
} as const;
export const channelResponses = {
	'config:read': AppConfigResponseSchema,
	'field-mappings:create': FieldMappingSchema,
	'field-mappings:read': FindFieldMappingsResponseSchema,
	'field-mappings:update': FindFieldMappingsResponseSchema,
	'field-mapping:clear': RemoveFieldMappingResponseSchema,
	'field-mappings:delete': {},
	'columns:read': FindDbColumnsResponseSchema,
	'options:read': FindFormOptionsResponseSchema,
	'config:create': {},
	'config:update': AppConfigResponseSchema,
	'config:delete': {},
	'submissions:create': {},
	'submissions:read': createPaginatedResultSchema(FormSubmissionSchema),
	'submissions:update': {},
	'submissions:delete': {},
	'db:test': TestDbConnectionResponseSchema,
	'translations:read': LoadTranslationResponseSchema,
	'submission-data:read': FindSubmissionDataResponseSchema,
	'suggestions:read': GetAutoCompletionSuggestionsResponseSchema,
	'submission-ref:read': FindSubmissionRefResponseSchema,
	'index-suggestions:read': FindIndexSuggestionsResponseSchema,
	'theme:update': AppConfigResponseSchema,
	'resource:read': z.string().nullable(),
	'submission-data:update': UpdateSubmissionResponseSchema,
	'locale:update': AppConfigResponseSchema,
	'submission-versions:read': FindSubmissionVersionsResponseSchema,
	'submission-version:read': FindSubmissionCurrentVersionResponseSchema,
	'submission-version:init': InitializeSubmissionVersionResponseSchema,
	'submission:revert': VersionRevertResponseSchema
} as const;

export type PushEvent = z.output<typeof PushEventSchema>;
export type Channel =
	z.output<typeof ChannelSchema>
	| 'submission:revert'
	| 'submission-version:init'
	| 'submission-version:read'
	| 'submission-versions:read'
	| 'locale:update'
	| 'field-mapping:clear'
	| 'submission-data:update'
	| 'resource:read'
	| 'theme:update'
	| 'index-suggestions:read'
	| 'submission-ref:read'
	| 'suggestions:read'
	| 'db:test'
	| 'translations:read'
	| 'options:read'
	| 'columns:read'
	| 'submission-data:read';
export type ChannelArg<T extends keyof typeof channelArgs> = typeof channelArgs[T] extends z.ZodType ? z.input<typeof channelArgs[T]> : never;
export type ChannelResponse<T extends keyof typeof channelResponses> = typeof channelResponses[T] extends z.ZodType ? z.output<typeof channelResponses[T]> : typeof channelResponses[T] extends {} ? void : void;

export const RpcHeadersSchema = z.object({
	ts: z.any().optional(),
	messageId: z.string(),
	srcChannel: z.string(),
	timeout: z.number().optional()
});
export type RpcInputHeaders = z.input<typeof RpcHeadersSchema>;
export const RpcBaseSchema = z.object({
	headers: RpcHeadersSchema
});

export function rpcMessageSchema<T extends z.ZodType>(schema: T) {
	return RpcBaseSchema.extend({
		body: schema.optional()
	});
}
