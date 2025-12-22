import { AppError, AppErrorSchema, rpcMessageSchema } from '@civilio/shared';
import { IpcMainEvent } from 'electron';
import Logger from 'electron-log';
import z from 'zod';
import { logResponse } from './logger';

export function reportError(logger: Logger.LogFunctions, ev: IpcMainEvent, err: AppError) {
	const schema = rpcMessageSchema(AppErrorSchema);
	const data = {
		headers: {
			messageId: err.messageId,
			srcChannel: err.srcChannel
		},
		body: {
			code: err.code,
			messageId: err.messageId,
			data: err.data,
			message: err.message,
			srcChannel: err.srcChannel
		}
	} as z.output<typeof schema>;
	ev.sender.send('error', data);
	logger.error(err);
	logResponse('error', data);
}
