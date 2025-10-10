import z from "zod";
import { Channel } from "../channels";

export type InferOutput<T extends z.ZodType> = z.output<T>;
export function computeReplyChannel(channel: Channel) {
  return `${channel}-reply` as const;
}

export function toColumnMajor<R>(data: Record<string, unknown>[], transform?: (key: string, v: unknown) => R) {
  const result: Record<string, R[]> = {};

  const keys = new Set<string>(data.flatMap(o => Object.keys(o)));
  for (const key of keys) {
    result[key] = data.map(o => transform?.(key, o[key]) ?? null);
  }
  return result;
}
