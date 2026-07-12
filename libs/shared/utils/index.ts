import { flatten } from 'flat';
import entries from 'lodash/entries';
import isEqual from "lodash/isEqual";
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

export async function pause(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}


export function deepObjectDiff<R extends object, U extends object>(a: R, b: U) {
	if (Object.is(a, b)) return {};
	const flatA = flatten<R, Record<string, unknown>>(a);
	const flatB = flatten<U, Record<string, unknown>>(b);

	const diff: Record<string, unknown> = {};
	const entriesA = entries(flatA);
	for (const [key, value] of entriesA) {
		const bVal = flatB[key];
		if (isEqual(bVal, value)) continue;
		diff[key] = bVal;
	}

	return diff;
}
