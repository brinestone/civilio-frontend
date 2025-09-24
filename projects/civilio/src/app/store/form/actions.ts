import { FieldUpdateSpec, FormType, UpdateFieldMappingRequest } from "@civilio/shared";

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

export class UpdateMappings {
  static type = `${prefix} update mappings`;
  readonly mappings: FieldUpdateSpec[];
  constructor(readonly form: FormType, ...mappings: FieldUpdateSpec[]) {
    this.mappings = mappings;
  }
}
