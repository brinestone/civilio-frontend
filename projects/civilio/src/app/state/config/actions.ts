import { Locale, ThemeMode } from "@civilio/shared";

const prefix = '[config]';

export class LoadConfig {
  static type = `${prefix} load configs`
}

export class SetTheme {
  static type = `${prefix} set theme`;
  constructor(readonly value: ThemeMode) { }
}

export class SetLocale {
  static type = `${prefix} set locale`;
  constructor(readonly locale: Locale) { }
}
