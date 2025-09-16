import { usePrefs } from "@civilio/helpers/store";

export function getAppConfig() {
  const prefs = usePrefs();
  return prefs;
}
