import z from 'zod';
import { FindFieldMappingsRequestSchema, FindFormSubmissionsRequestSchema, TestDbConnectionRequestSchema, TestDbConnectionResponseSchema, UpdateFieldMappingRequestSchema } from './dto';
import { AppConfigSchema, createPaginatedResultSchema, FieldMappingSchema, FormSubmissionSchema } from './schema';
import { Observable } from 'rxjs';

const entities = z.enum(['field-mappings', 'config', 'submissions']);
const crudActions = z.enum(['create', 'read', 'update', 'delete']);
export const ChannelSchema = z.templateLiteral([
  entities, ':', crudActions
]);
const channelArgs = {
  'field-mappings:create': UpdateFieldMappingRequestSchema,
  'field-mappings:read': FindFieldMappingsRequestSchema,
  'field-mappings:update': UpdateFieldMappingRequestSchema,
  'field-mappings:delete': {},
  'config:read': {},
  'config:create': {},
  'config:update': {},
  'config:delete': {},
  'submissions:create': {},
  'submissions:read': FindFormSubmissionsRequestSchema,
  'submissions:update': {},
  'submissions:delete': {},
  'db:test': TestDbConnectionRequestSchema
} as const;
const channelResponses = {
  'config:read': AppConfigSchema.nullable(),
  'field-mappings:create': FieldMappingSchema,
  'field-mappings:read': FieldMappingSchema.array(),
  'field-mappings:update': FieldMappingSchema,
  'field-mappings:delete': {},
  'config:create': {},
  'config:update': {},
  'config:delete': {},
  'submissions:create': {},
  'submissions:read': createPaginatedResultSchema(FormSubmissionSchema),
  'submissions:update': {},
  'submissions:delete': {},
  'db:test': TestDbConnectionResponseSchema
}
type InferZod<T extends z.ZodType> = z.infer<T>;
type MaybeAsync<T> = Promise<T> | Observable<T> | T;
export type Channel = z.output<typeof ChannelSchema> | 'db:test';
// export type ChannelArg<T extends keyof typeof channelArgs> = typeof channelArgs[T] extends {} ? never : typeof channelArgs[T] extends z.ZodType ? InferZod<typeof channelArgs[T]> : never;
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
