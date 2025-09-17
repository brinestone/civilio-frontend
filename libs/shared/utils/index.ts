import z from "zod";
import { Channel } from "../channels";

export type InferOutput<T extends z.ZodType> = z.output<T>;
export function computeReplyChannel(channel: Channel) {
  return `${channel}-reply` as const;
}
