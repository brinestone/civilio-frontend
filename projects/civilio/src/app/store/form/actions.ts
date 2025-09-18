import { FormType } from "@civilio/shared";

const prefix = '[form]';

export class LoadMappings {
  static type = `${prefix} load mappings`;
  constructor(readonly form: FormType) { }
}
