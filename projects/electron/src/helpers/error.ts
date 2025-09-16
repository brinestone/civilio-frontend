import { AppError, AppErrorSchema, rpcMessageSchema } from '@civilio/shared';
import { IpcMainEvent } from 'electron';
import z from 'zod';

export function reportError(ev: IpcMainEvent, err: AppError) {
  const schema = rpcMessageSchema(AppErrorSchema);
  ev.sender.send('error', {
    headers: {
      messageId: err.messageId,
      srcChannel: err.srcChannel
    }
  } as z.output<typeof schema>);
}
