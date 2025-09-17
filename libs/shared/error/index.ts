import z from 'zod';
import { Channel } from '../channels';

export const ErrorCodeSchema = z.enum(['bad_request', 'mal_config', 'timeout', 'execution_error']);
export const ErrorDataSchema = z.unknown();

export const AppErrorSchema = z.object({
  code: ErrorCodeSchema,
  messageId: z.string(),
  srcChannel: z.string().optional(),
  message: z.string().optional(),
  data: ErrorDataSchema.optional()
});

export abstract class AppErrorBase extends Error implements AppError {
  abstract code: ErrorCode;
  protected constructor(readonly messageId: string, readonly srcChannel?: string, message?: string) {
    super(message);
  }
}

export class BadRequestError extends AppErrorBase {
  readonly code = 'bad_request';
  constructor(messageId: string, srcChannel: string, message: string) {
    super(messageId, srcChannel, message);
  }
}

export class TimeoutError extends AppErrorBase {
  readonly code = 'timeout';
  constructor(readonly timeout: number, srcChannel: Channel, messageId: string) {
    super(messageId, srcChannel, `timeout error after: ${timeout}ms`);
  }
}

export class ExecutionError extends Error implements AppError {
  readonly code = 'execution_error';
  constructor(message: string, readonly srcChannel: Channel, readonly messageId: string, public readonly data?: ErrorData) {
    super(message);
  }
}

export class MalConfigurationError extends Error implements AppError {
  readonly code = 'mal_config';

  constructor(public readonly configKey: string, readonly messageId: string = '', public readonly data?: ErrorData) {
    super(`'${configKey}' is not configured`);
  }
}

export type ErrorData = z.infer<typeof ErrorDataSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type AppError = z.infer<typeof AppErrorSchema>;
