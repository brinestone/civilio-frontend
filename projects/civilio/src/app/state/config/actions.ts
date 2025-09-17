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

export class TestDb {
  static type = `${prefix} test connection`;
  constructor(
    readonly host: string,
    readonly port: number,
    readonly database: string,
    readonly username: string,
    readonly password: string,
    readonly ssl: boolean = false
  ) { }
}
