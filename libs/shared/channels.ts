import { Observable } from 'rxjs';
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
  FindIndexSuggestionsRequestSchema,
  FindIndexSuggestionsResponseSchema,
  FindSubmissionDataRequestSchema,
  FindSubmissionDataResponseSchema,
  FindSubmissionRefRequestSchema,
  FindSubmissionRefResponseSchema,
  GetAutoCompletionSuggestionsRequestSchema,
  GetAutoCompletionSuggestionsResponseSchema,
  LoadTranslationRequestSchema,
  LoadTranslationResponseSchema,
  TestDbConnectionRequestSchema,
  TestDbConnectionResponseSchema,
  UpdateConfigRequestSchema,
  UpdateFieldMappingRequestSchema,
  UpdateThemeRequestSchema
} from './dto';
import { createPaginatedResultSchema, FieldMappingSchema, FormSubmissionSchema } from './schema';

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
  'index-suggestions:read': FindIndexSuggestionsRequestSchema,
  'theme:update': UpdateThemeRequestSchema
} as const;
export const channelResponses = {
  'config:read': AppConfigResponseSchema,
  'field-mappings:create': FieldMappingSchema,
  'field-mappings:read': FindFieldMappingsResponseSchema,
  'field-mappings:update': FindFieldMappingsResponseSchema,
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
  'theme:update': AppConfigResponseSchema
} as const;

type InferZod<T extends z.ZodType> = z.infer<T>;
export type MaybeAsync<T> = Promise<T> | Observable<T> | T;
export type PushEvent = z.output<typeof PushEventSchema>;
export type Channel = z.output<typeof ChannelSchema> | 'theme:update' | 'index-suggestions:read' | 'submission-ref:read' | 'suggestions:read' | 'db:test' | 'translations:read' | 'options:read' | 'columns:read' | 'submission-data:read';
export type ChannelArg<T extends keyof typeof channelArgs> = typeof channelArgs[T] extends z.ZodType ? InferZod<typeof channelArgs[T]> : never;
export type ChannelResponse<T extends keyof typeof channelResponses> = typeof channelResponses[T] extends z.ZodType ? InferZod<typeof channelResponses[T]> : typeof channelResponses[T] extends {} ? void : never;
export const RequestOptionsSchema = z.object({
  timeout: z.number().default(30_000) // 30 seconds
});
export type RequestOptions = z.infer<typeof RequestOptionsSchema>;

export function createChannelRequestFn<TChannel extends Channel>(channel: TChannel, procFn: (c: TChannel, param: ChannelArg<TChannel>, opts?: RequestOptions) => MaybeAsync<ChannelResponse<TChannel>>, options?: RequestOptions) {
  return (arg: ChannelArg<TChannel>) => {
    return procFn(channel, arg, options);
  }
}

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
