import { reportError } from '@civilio/helpers/error';
import { logRequest, logResponse } from '@civilio/helpers/logger';
import { provideLogger } from '@civilio/helpers/logging';
import {
	AppErrorBase,
	Channel,
	ChannelArg,
	channelArgs,
	ChannelResponse,
	computeReplyChannel,
	ExecutionError,
	RpcBaseSchema,
	RpcInputHeaders,
	ServiceEventPayload
} from '@civilio/shared';
import { randomBytes } from 'crypto';
import { BrowserWindow, ipcMain } from 'electron';
import { isPromise } from 'util/types';
import z from 'zod';

export * from './config';
export * from './form';
export * from './i18n';
export * from './resource';
export * from './user';

const logger = provideLogger('handler-registrar');

function generateMessageId() {
	return randomBytes(5).toString('hex');
}

// Helper to convert an AsyncIterableIterator into an array of Promises
// representing the NEXT available item from each stream.
function getNextPromises(iterators: AsyncIterator<ServiceEventPayload>[]) {
	return iterators.map(async (iterator, index) => {
		const { value, done } = await iterator.next();
		// Re-resolve the promise with the original index so we know which stream yielded
		return { index, value, done };
	});
}

/**
 * Creates a unified handler that monitors multiple service generators concurrently.
 * @param eventName The IPC channel name to publish the 'down' event on.
 * @param generators An array of async generator functions to monitor.
 */
export async function createUnifiedServiceMonitor(
	window: BrowserWindow,
	eventName: string,
	generators: (() => AsyncIterable<ServiceEventPayload>)[]
) {
	// 1. Get the async iterators
	const iterators = generators.map(g => g()[Symbol.asyncIterator]());

	// 2. Start the main concurrent loop
	while (iterators.length > 0) {
		// A. Create an array of Promises, where each promise is the next value from one stream
		const promises = getNextPromises(iterators);

		// B. Wait for the FIRST stream to yield a value
		const { index, value, done } = await Promise.race(promises);

		// C. Handle the result
		if (done) {
			// The stream has finished (it shouldn't for an infinite watcher, but handle it)
			console.log(`Service monitor stream at index ${index} finished.`);
			iterators.splice(index, 1); // Remove the finished iterator
		} else {
			// D. A service has yielded an event (e.g., it went offline)
			console.log(`[${value.service} Status Change]`, value);

			window.webContents.send('push-notifications', { ...value, event: eventName });
		}
	}
}

export function createChannelHandler<TChannel extends Channel>(channel: TChannel, handler: ChannelArg<TChannel> extends void | never ? () => unknown : (arg: ChannelArg<TChannel>) => ChannelResponse<TChannel> | Promise<ChannelResponse<TChannel>>) {
	// console.time(channel);
	logger.debug('Registering IPC handler', 'channel', channel);
	const replyChannel = computeReplyChannel(channel);
	ipcMain.on(channel, async (event, eventData) => {
		logRequest(channel, eventData);
		let body: ChannelArg<TChannel> | undefined;
		let headers: RpcInputHeaders = eventData.headers;
		let messageId: string = headers.messageId;
		const bodySchema = channelArgs[channel];
		try {
			const rpc = RpcBaseSchema.parse(eventData);
			headers = rpc.headers;
			if (bodySchema instanceof z.ZodType && 'body' in eventData) {
				body = bodySchema.parse(eventData.body) as ChannelArg<TChannel> | undefined;
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
			logger.error(e);
			reportError(logger, event, e instanceof AppErrorBase ? e : new ExecutionError(e.message, e, channel, messageId, e))
			// console.timeEnd(channel);
		}
	})
}
