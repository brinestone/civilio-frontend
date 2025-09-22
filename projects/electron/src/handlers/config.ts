import { getStoreValue } from "@civilio/helpers/store";
import { AppConfigSchema } from "@civilio/shared";
import z from "zod";

export function getAppConfig() {
  const keys = z.keyof(AppConfigSchema.unwrap()).options;
  const map: any = {};
  keys.forEach(k => map[k] = getStoreValue(k));
  return AppConfigSchema.parse(map);
}
