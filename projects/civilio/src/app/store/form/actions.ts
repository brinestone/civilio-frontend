import { FormType } from "@civilio/shared";

const prefix = '[form]';

export class LoadMappings {
  static type = `${prefix} load mappings`;
  constructor(readonly form: FormType) { }
}

export class LoadOptions {
  static type = `${prefix} load options`
  constructor(readonly form: FormType) { }
}

export class LoadDbColumns {
  static type = `${prefix} load columns`;
  constructor(readonly form: FormType) { }
}
