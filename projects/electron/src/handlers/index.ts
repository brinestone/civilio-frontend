import { reportError } from '@civilio/helpers/error';
import { AppErrorBase, Channel, computeReplyChannel, ExecutionError, InferOutput, RpcBaseSchema, RpcInputHeaders, rpcMessageSchema } from '@civilio/shared';
import { ipcMain } from 'electron';
import { isPromise } from 'util/types';
import z from 'zod';

export * from './config';
export * from './submissions';

export function respondingNoInputChannelHandler<TChannel extends Channel>(channel: TChannel, handler: () => unknown) {
  const replyChannel = computeReplyChannel(channel);
  ipcMain.on(channel, async (event, eventData) => {
    const rpcSchema = RpcBaseSchema;
    let messageId: string = '';
    try {
      const rpc = rpcSchema.parse(eventData);
      messageId = rpc.headers.messageId;
      let result = handler();
      if (isPromise(result)) {
        result = await result;
      }
      const replyData: any = {
        headers: {
          messageId: rpc.headers.messageId,
          srcChannel: channel,
          ts: new Date(),
        } as RpcInputHeaders,
        body: result ?? null
      };
      event.sender.send(replyChannel, replyData);
    } catch (e) {
      reportError(event, e instanceof AppErrorBase ? e : new ExecutionError(e.message, channel, messageId, e));
    }
  })
}

export function respondingInputChannelHandler<TChannel extends Channel, TInputSchema extends z.ZodType>(
  channel: TChannel,
  schema: TInputSchema,
  handler: (rpc: z.infer<TInputSchema>) => Promise<unknown> | unknown) {
  const replyChannel = computeReplyChannel(channel);
  ipcMain.on(channel, (event, eventData) => {
    const rpcSchema = rpcMessageSchema(schema);
    let messageId: string = '';
    try {
      const rpc = rpcSchema.parse(eventData);
      messageId = rpc.headers.messageId;
      const result = handler(rpc.body);
      const replyData: any = {
        headers: {
          messageId: rpc.headers.messageId,
          srcChannel: channel,
          ts: new Date(),
        } as RpcInputHeaders,
        body: result ?? null
      };
      event.sender.send(replyChannel, replyData);
    } catch (e) {
      reportError(event, e instanceof AppErrorBase ? e : new ExecutionError(e.message, channel, messageId, e));
    }
  });
}
