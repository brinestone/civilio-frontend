import { cloneDeepWith, isArray, isObject, isString, last } from 'lodash';
import z from "zod";
import { Channel } from "../channels";

export type UnwrapArray<T> = T extends (infer U)[] ? U : T;

export type InferOutput<T extends z.ZodType> = z.output<T>;
export function computeReplyChannel(channel: Channel) {
	return `${channel}-reply` as const;
}

export function deepTransform<R>(input: unknown, transformFn: (key: string, v: unknown) => R) {
	return cloneDeepWith(input, (value, k) => {
		if (!isArray(value) && !isObject(value) && isString(k)) {
			return transformFn(k as string, value);
		}
		return undefined;
	})
}

export function toRowMajor<R>(data: Record<string, unknown[]>, transform: (key: string, v: unknown) => R) {
	const entries = Object.entries(data ?? {});
	const rowCount = entries.filter(([_, entry]) => entry != null)
		.map(([_, entry]) => entry?.length ?? 0)
		.reduce((max, curr) => Math.max(curr, max), Number.MIN_SAFE_INTEGER);

	const result = Array.from({ length: rowCount }, (_, index) => {
		return entries.reduce((acc, [k, v]) => {
			const transformedValue = transform(k, v[index]);
			acc[k] = transformedValue;
			return acc;
		}, {} as Record<string, R>)
	});
	return result;
}
