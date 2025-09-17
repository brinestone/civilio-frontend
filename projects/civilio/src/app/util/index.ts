import { inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppErrorSchema, Channel, computeReplyChannel, RpcBaseSchema, RpcInputHeaders, rpcMessageSchema, TimeoutError } from "@civilio/shared";
import { Actions, ActionType, ofActionCompleted, ofActionDispatched } from "@ngxs/store";
import { map, merge } from "rxjs";

export function isActionLoading(action: ActionType) {
  const actions$ = inject(Actions);
  const s = signal(false);
  merge(
    actions$.pipe(ofActionDispatched(action), map(() => true)),
    actions$.pipe(ofActionCompleted(action), map(() => false)),
  ).pipe(
    takeUntilDestroyed()
  ).subscribe(v => s.set(v));
  return s.asReadonly()
}

export function isDesktop() {
  return window && 'electron' in window;
}

function generateMessageId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWQYZ0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export async function sendRpcMessageAsync(channel: Channel, data: unknown = undefined, timeout: number = 30000) {
  const id = generateMessageId();
  const replyChannel = computeReplyChannel(channel);
  return new Promise((resolve, reject) => {
    const cleanup = (closeTimer = true) => {
      window.electron.off('error', errorHandler);
      window.electron.off(replyChannel, replyHandler);
      if (closeTimer)
        clearTimeout(timer);
    }
    const errorHandler = (_: any, arg: any) => {
      const err = rpcMessageSchema(AppErrorSchema).parse(arg);
      if (err.headers.messageId === id && err.headers.srcChannel === channel) {
        reject(err);
        cleanup();
      }
    };
    const replyHandler = (_: any, arg: any) => {
      const rpc = RpcBaseSchema.parse(arg);
      if (id === rpc.headers.messageId && rpc.headers.srcChannel === channel) {
        if (arg && 'body' in arg) {
          resolve(arg.body);
        }
        cleanup();
      }
    }
    window.electron.on('error', errorHandler);
    window.electron.on(replyChannel, replyHandler);
    window.electron.send(channel, {
      headers: {
        srcChannel: channel,
        messageId: id,
        ts: Date.now(),
        timeout
      } as RpcInputHeaders,
      body: data ?? undefined
    });
    const timer = setTimeout(() => {
      reject(new TimeoutError(timeout, channel, id));
      cleanup(false);
    }, timeout)
  })
}
