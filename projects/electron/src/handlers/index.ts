import { reportError } from '@civilio/helpers/error';
import { logRequest, logResponse } from '@civilio/helpers/logger';
import { AppErrorBase, Channel, ChannelArg, channelArgs, computeReplyChannel, ExecutionError, PushEvent, RpcBaseSchema, RpcInputHeaders, rpcMessageSchema } from '@civilio/shared';
import { randomBytes } from 'crypto';
import { ipcMain, ipcRenderer } from 'electron';
import { isPromise } from 'util/types';
import z from 'zod';

export * from './config';
export * from './form';
export * from './i18n';
export * from './resource';

function generateMessageId() {
	return randomBytes(5).toString('hex');
}

export async function createPushHandler<TEvent extends PushEvent>(ev: TEvent, eventSourceProvider: () => Promise<AsyncIterable<any>>) {
	const eventSource = await eventSourceProvider();
	for await (const event of eventSource) {
		const rpc = {
			headers: {
				messageId: generateMessageId(),
				srcChannel: 'push-notifications',
				ts: new Date()
			} as RpcInputHeaders,
			body: {
				event: ev, data: event
			}
		};

		ipcRenderer.send('push-notifications', rpc);
	}
}

export function createChannelHandler<TChannel extends Channel>(channel: TChannel, handler: ChannelArg<TChannel> extends void | never ? () => unknown : (arg: ChannelArg<TChannel>) => unknown) {
	console.time(channel);
	const replyChannel = computeReplyChannel(channel);
	ipcMain.on(channel, async (event, eventData) => {
		logRequest(channel, eventData);
		let body: ChannelArg<TChannel> | undefined;
		let headers: RpcInputHeaders = eventData.headers;
		let messageId: string = headers.messageId;
		const bodySchema = channelArgs[channel];
		try {
			if (bodySchema instanceof z.ZodType) {
				const rpc = rpcMessageSchema(bodySchema).parse(eventData);
				headers = rpc.headers;
				body = rpc.body as ChannelArg<TChannel> | undefined;
			} else {
				const rpc = RpcBaseSchema.parse(eventData);
				headers = rpc.headers;
			}
			messageId = headers.messageId;
			let result = handler(body);
			if (isPromise(result)) {
				result = await result;
			}
			const replyRpc: any = {
				headers: {
					messageId: headers.messageId,
					srcChannel: channel,
					ts: Date.now(),
				} as RpcInputHeaders,
				body: result ?? null
			};
			event.sender.send(replyChannel, replyRpc);
			logResponse(channel, replyRpc);
		} catch (e) {
			reportError(event, e instanceof AppErrorBase ? e : new ExecutionError(e.message, channel, messageId, e))
			console.timeEnd(channel);
		}
	})
}
