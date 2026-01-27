import { inject, Injector, Signal, signal, untracked } from "@angular/core";
import {
	takeUntilDestroyed,
	toObservable,
	toSignal,
} from "@angular/core/rxjs-interop";
import {
	AppErrorSchema,
	Channel,
	ChannelArg,
	ChannelResponse,
	computeReplyChannel,
	RpcBaseSchema,
	RpcInputHeaders,
	rpcMessageSchema,
	TimeoutError,
} from "@civilio/shared";
import {
	Actions,
	ActionType,
	ofActionCompleted,
	ofActionDispatched,
} from "@ngxs/store";
import { derivedFrom } from "ngxtension/derived-from";
import {
	debounceTime,
	filter,
	from,
	map,
	merge,
	mergeMap,
	OperatorFunction,
	pipe,
	scan,
} from "rxjs";

export function maskString(value: string, maskChar = '.', maskMaxLength = 3) {
	if (value.length <= 4) return value;
	const start = Math.floor(.333 * value.length);
	const end = Math.floor(.8 * value.length);
	const mask = maskChar.repeat(Math.min(end - start, maskMaxLength));
	const prefix = value.substring(0, Math.min(4, start));
	const suffix = value.substring(Math.max(value.length - 2, end));
	return [prefix, mask, suffix].join('');
}

export async function isLockHeld(name: string) {
	return await navigator.locks
		.query()
		.then(({ held }) => (held?.findIndex((l) => l.name === name) ?? -1) > 0);
}

export function mapSignal<T, U, R>(
	src: Signal<T>,
	key: string,
	operator?: OperatorFunction<U, R>,
	opts?: Partial<{ initialValue: U; injector: Injector }>,
) {
	const src$ = toObservable(src, { injector: opts?.injector }).pipe(
		mergeMap((v) => Object.entries(v as any)),
		filter(([k]) => k === key),
		map(([_, v]) => v as U),
	);

	return operator
		? toSignal<R>(operator(src$), { injector: opts?.injector })
		: toSignal<U>(src$, { injector: opts?.injector });
}

export function debounceSignal<T>(src: Signal<T>, t: number = 500) {
	return toSignal(toObservable(src).pipe(debounceTime(t)), {
		initialValue: untracked(src),
	});
}

export function actionsLoading(...actions: ActionType[]) {
	const actions$ = inject(Actions);
	const source = signal(false);
	from(actions)
		.pipe(
			takeUntilDestroyed(),
			mergeMap((action) =>
				merge(
					actions$.pipe(
						ofActionDispatched(action),
						map(() => true),
					),
					actions$.pipe(
						ofActionCompleted(action),
						map(() => false),
					),
				),
			),
			scan((acc, curr) => curr && acc),
		)
		.subscribe((v) => source.set(v));
	return source.asReadonly();
}

export function isActionLoading(action: ActionType) {
	const actions$ = inject(Actions);
	return derivedFrom(
		[
			merge([
				actions$.pipe(
					ofActionDispatched(action),
					map(() => true),
				),
				actions$.pipe(
					ofActionCompleted(action),
					map(() => false),
				),
			]),
		],
		pipe(mergeMap(([src$]) => src$)),
		{ initialValue: false },
	);
}

export function isDesktop() {
	return window && "electron" in window;
}

export function randomString(len = 20) {
	const alphabet =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWQYZ0123456789";
	let result = "";
	for (let i = 0; i < len; i++) {
		result += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return result;
}

function generateMessageId() {
	return randomString();
}

export async function sendRpcMessageAsync<TChannel extends Channel>(
	channel: TChannel,
	data: ChannelArg<TChannel> | undefined = undefined,
): Promise<ChannelResponse<TChannel>> {
	return new Promise(async (resolve, reject) => {
		try {
			resolve(await window.electron.invoke(channel, data));
		} catch (e) {
			reject(e);
		}
		// const cleanup = (closeTimer = true) => {
		// 	window.electron.off("error", errorHandler);
		// 	window.electron.off(replyChannel, replyHandler);
		// 	if (closeTimer) clearTimeout(timer);
		// 	console.timeEnd(timeKey);
		// };
		// const errorHandler = (_: any, arg: any) => {
		// 	const rpc = rpcMessageSchema(AppErrorSchema).parse(arg);
		// 	if (rpc.headers.messageId === id && rpc.headers.srcChannel === channel) {
		// 		reject(rpc.body);
		// 		cleanup();
		// 	}
		// };
		// const replyHandler = (_: any, arg: any) => {
		// 	const rpc = RpcBaseSchema.parse(arg);
		// 	if (id === rpc.headers.messageId && rpc.headers.srcChannel === channel) {
		// 		if (arg && "body" in arg) {
		// 			resolve(arg.body);
		// 		}
		// 		cleanup();
		// 	}
		// };
		// window.electron.on("error", errorHandler);
		// window.electron.on(replyChannel, replyHandler);
		// window.electron.send(channel, {
		// 	headers: {
		// 		srcChannel: channel,
		// 		messageId: id,
		// 		ts: Date.now(),
		// 		timeout,
		// 	} as RpcInputHeaders,
		// 	body: data ?? undefined,
		// });
		// const timer = setTimeout(() => {
		// 	reject(new TimeoutError(timeout, channel, id));
		// 	cleanup(false);
		// }, timeout);
	});
}
