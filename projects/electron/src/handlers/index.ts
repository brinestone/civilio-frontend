import { reportError } from '@civilio/helpers/error';
import { logRequest, logResponse } from '@civilio/helpers/logger';
import { AppErrorBase, Channel, computeReplyChannel, ExecutionError, RpcBaseSchema, RpcInputHeaders, rpcMessageSchema } from '@civilio/shared';
import { ipcMain } from 'electron';
import { isPromise } from 'util/types';
import z from 'zod';

export * from './config';
export * from './form';
export * from './i18n';

export function respondingNoInputChannelHandler<TChannel extends Channel>(channel: TChannel, handler: () => unknown) {
  console.time(channel);
  const replyChannel = computeReplyChannel(channel);
  ipcMain.on(channel, async (event, eventData) => {
    logRequest(channel, eventData);
    const rpcSchema = RpcBaseSchema;
    let messageId: string = '';
    try {
      const rpc = rpcSchema.parse(eventData);
      messageId = rpc.headers.messageId;
      let result = handler();
      if (isPromise(result)) {
        result = await result;
      }
      const replyRpc: any = {
        headers: {
          messageId: rpc.headers.messageId,
          srcChannel: channel,
          ts: Date.now(),
        } as RpcInputHeaders,
        body: result ?? null
      };
      event.sender.send(replyChannel, replyRpc);
      logResponse(channel, replyRpc);
    } catch (e) {
      reportError(event, e instanceof AppErrorBase ? e : new ExecutionError(e.message, channel, messageId, e));
      console.timeEnd(channel);
    }
  })
}

export function respondingInputChannelHandler<TChannel extends Channel, TInputSchema extends z.ZodType>(
  channel: TChannel,
  schema: TInputSchema,
  handler: (rpc: z.infer<TInputSchema>) => Promise<unknown> | unknown) {
  const replyChannel = computeReplyChannel(channel);
  ipcMain.on(channel, async (event, eventData) => {
    logRequest(channel, eventData);
    const rpcSchema = rpcMessageSchema(schema);
    const rpc = rpcSchema.parse(eventData);
    let messageId: string = '';
    try {
      console.time(`${channel}::${rpc.headers.messageId}`);
      messageId = rpc.headers.messageId;
      let result = handler(rpc.body);
      if (isPromise(result)) {
        result = await result;
      }
      const replyData: any = {
        headers: {
          messageId: rpc.headers.messageId,
          srcChannel: channel,
          ts: Date.now(),
        } as RpcInputHeaders,
        body: result ?? null
      };
      event.sender.send(replyChannel, replyData);
      logResponse(channel, replyData);
    } catch (e) {
      reportError(event, e instanceof AppErrorBase ? e : new ExecutionError(e.message, channel, messageId, e));
    } finally {
      console.timeEnd(`${channel}::${rpc.headers.messageId}`);
    }
  });
}
