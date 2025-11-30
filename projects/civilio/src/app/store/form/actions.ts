import { FormSchema, ParsedValue } from "@app/model/form";
import {
	FieldKey,
	FieldUpdateSpec,
	FormSectionKey,
	FormType,
	InitializeSubmissionVersionRequest,
} from "@civilio/shared";
import { DeltaChangeEvent } from '@app/model/form/events';

const prefix = "[form]";

export class RevertToVersion {
	static type = `${ prefix } revert to version`;

	constructor(readonly form: FormType,
							readonly changeNotes: string,
							readonly index?: number | string,
							readonly customVersion?: string) {
	}
}

export class SaveChanges {
	static type = `${ prefix } save  changes`;

	constructor(readonly form: FormType, readonly changeNotes: string, readonly index?: number | string, readonly customVersion?: string) {
	}
}

export class DiscardChanges {
	static type = `${ prefix } discard changes`;

	constructor(readonly form: FormType) {
	}
}

export class Undo {
	static type = `${ prefix } undo`;

	constructor(readonly form: FormType) {
	}
}

export class Redo {
	static type = `${ prefix } redo`;

	constructor(readonly form: FormType) {
	}
}

export class RecordDeltaChange {
	static type = `${ prefix } record delta change`
	readonly events: DeltaChangeEvent<any>[];

	constructor(...events: DeltaChangeEvent<any>[]) {
		this.events = events;
	}
}

export class InitVersioning implements InitializeSubmissionVersionRequest {
	static type = `${ prefix } Init versioning`;

	constructor(readonly index: unknown, readonly form: FormType) {
	}
}

export class SubmissionIndexChanged {
	static type = `${ prefix } Index changed`;

	constructor(readonly index: number) {
	}
}

export class DeactivateForm {
	static type = `${ prefix } Deactivate form`;

	constructor(readonly form: FormType) {
	}
}

export class UpdateFormDirty {
	static type = `${ prefix } Update Form Status`;

	constructor(
		readonly section: FormSectionKey,
		readonly dirty: boolean,
	) {
	}
}

export class ActivateForm {
	static type = `${ prefix } Activate form`;

	constructor(readonly schema: FormSchema) {
	}
}

export class LoadSubmissionData {
	static type = `${ prefix } Load submission data`;

	constructor(readonly form: FormType, readonly index: number | string, readonly version?: string) {
	}
}

export class UpdateValidity {
	static type = `${ prefix } Update validity`;

	constructor(readonly form: FormType) {
	}
}

export class UpdateRelevance {
	static type = `${ prefix } Update relevance`;

	constructor(
		readonly form: FormType,
		readonly section?: FormSectionKey,
		readonly field?: FieldKey,
	) {
	}
}

export class UpdateSection {
	static type = `${ prefix } Update section`;

	constructor(
		readonly section: FormSectionKey,
		readonly form: FormType,
		readonly field: FieldKey,
		readonly value?: ParsedValue | ParsedValue[] | Record<string, ParsedValue | ParsedValue[]>[]
	) {
	}
}

export class ActivateSection {
	static type = `${ prefix } Activate section`;

	constructor(
		readonly section: FormSectionKey,
		readonly form: FormType
	) {
	}
}

export class LoadMappings {
	static type = `${ prefix } load mappings`;

	constructor(readonly form: FormType) {
	}
}

export class LoadOptions {
	static type = `${ prefix } load options`;

	constructor(readonly form: FormType) {
	}
}

export class LoadDbColumns {
	static type = `${ prefix } load columns`;

	constructor(readonly form: FormType) {
	}
}

export class RemoveMapping {
	static type = `${ prefix } remove mapping`;

	constructor(
		readonly form: FormType,
		readonly field: FieldKey,
	) {
	}
}

export class UpdateMappings {
	static type = `${ prefix } update mappings`;
	readonly mappings: FieldUpdateSpec[];

	constructor(
		readonly form: FormType,
		...mappings: FieldUpdateSpec[]
	) {
		this.mappings = mappings;
	}
}

export class SetFormType {
	static type = `${ prefix } set form type`;

	constructor(readonly form: FormType) {
	}
}
