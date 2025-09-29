import { inject, Injector, Signal, signal, untracked } from "@angular/core";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { AppErrorSchema, Channel, ChannelArg, ChannelResponse, computeReplyChannel, RpcBaseSchema, RpcInputHeaders, rpcMessageSchema, TimeoutError } from "@civilio/shared";
import { Actions, ActionType, ofActionCompleted, ofActionDispatched } from "@ngxs/store";
import { debounceTime, filter, from, map, merge, mergeMap, OperatorFunction, scan } from "rxjs";

export function mapSignal<T, U, R>(src: Signal<T>, key: string, operator?: OperatorFunction<U, R>, opts?: Partial<{ initialValue: U, injector: Injector }>) {
  const src$ = toObservable(src, { injector: opts?.injector }).pipe(
    mergeMap(v => Object.entries(v as any)),
    filter(([k]) => k === key),
    map(([_, v]) => v as U),
  );

  return operator
    ? toSignal<R>(operator(src$), { injector: opts?.injector })
    : toSignal<U>(src$, { injector: opts?.injector });
}

export function debounceSignal<T>(src: Signal<T>, t: number = 500) {
  return toSignal(toObservable(src).pipe(
    debounceTime(t)
  ), { initialValue: untracked(src) });
}

export function actionsLoading(...actions: ActionType[]) {
  const actions$ = inject(Actions);
  const source = signal(false);
  from(actions).pipe(
    takeUntilDestroyed(),
    mergeMap(action => merge(actions$.pipe(ofActionDispatched(action), map(() => true)),
      actions$.pipe(ofActionCompleted(action), map(() => false)))),
    scan((acc, curr) => curr && acc)
  ).subscribe(v => source.set(v));
  return source.asReadonly();
}
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

export async function sendRpcMessageAsync<TChannel extends Channel>(channel: TChannel, data: ChannelArg<TChannel> | undefined = undefined, timeout: number = 30000): Promise<ChannelResponse<TChannel>> {
  const id = generateMessageId();
  const timeKey = `${channel}::${id}`;
  console.time(timeKey);
  const replyChannel = computeReplyChannel(channel);
  return new Promise((resolve, reject) => {
    const cleanup = (closeTimer = true) => {
      window.electron.off('error', errorHandler);
      window.electron.off(replyChannel, replyHandler);
      if (closeTimer)
        clearTimeout(timer);
      console.timeEnd(timeKey);
    }
    const errorHandler = (_: any, arg: any) => {
      const rpc = rpcMessageSchema(AppErrorSchema).parse(arg);
      if (rpc.headers.messageId === id && rpc.headers.srcChannel === channel) {
        reject(rpc.body);
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
