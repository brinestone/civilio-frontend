import { FormSchema, ParsedValue, RawValue } from "@app/model/form";
import {
	FieldKey,
	FieldUpdateSpec,
	FormSectionKey,
	FormType,
} from "@civilio/shared";

const prefix = "[form]";

export class ActivateForm {
	static type = `${prefix} Activate form`;
	constructor(readonly schema: FormSchema) { }
}

export class LoadSubmissionData {
	static type = `${prefix} Load submission data`;
	constructor(readonly form: FormType, readonly index: number | string) { }
}

export class UpdateRelevance {
	static type = `${prefix} Update relevance`;
	constructor(
		readonly form: FormType,
		readonly section?: FormSectionKey,
		readonly field?: FieldKey,
		// readonly value?: RawValue | ParsedValue | ParsedValue[]
	) { }
}

// export class ActivateSection {
// 	static type = `${prefix} Activate section`;
// 	constructor(
// 		readonly sectionId: FormSectionKey,
// 		readonly form: FormType
// 	) { }
// }

export class LoadMappings {
	static type = `${prefix} load mappings`;
	constructor(readonly form: FormType) { }
}

export class LoadOptions {
	static type = `${prefix} load options`;
	constructor(readonly form: FormType) { }
}

export class LoadDbColumns {
	static type = `${prefix} load columns`;
	constructor(readonly form: FormType) { }
}

export class RemoveMapping {
	static type = `${prefix} remove mapping`;
	constructor(
		readonly form: FormType,
		readonly field: FieldKey,
	) { }
}

export class UpdateMappings {
	static type = `${prefix} update mappings`;
	readonly mappings: FieldUpdateSpec[];
	constructor(
		readonly form: FormType,
		...mappings: FieldUpdateSpec[]
	) {
		this.mappings = mappings;
	}
}

export class SetFormType {
	static type = `${prefix} set form type`;
	constructor(readonly form: FormType) { }
}
