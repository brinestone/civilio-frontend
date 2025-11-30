import { Channel } from "../contracts";

export type Unwrap<T> = T extends (infer U)[] ? U : T;

export function computeReplyChannel(channel: Channel) {
	return `${channel}-reply` as const;
}
export function toRowMajor<R>(data: Record<string, unknown[]>, transform: (key: string, v: unknown) => R) {
	const entries = Object.entries(data ?? {});
	const rowCount = entries.filter(([_, entry]) => entry != null)
		.map(([_, entry]) => entry?.length ?? 0)
		.reduce((max, curr) => Math.max(curr, max), Number.MIN_SAFE_INTEGER);

	return Array.from({ length: rowCount }, (_, index) => {
		return entries.reduce((acc, [k, v]) => {
			acc[k] = transform(k, v[index]);
			return acc;
		}, {} as Record<string, R>)
	});
}
