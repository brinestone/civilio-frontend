import {
	FormType
} from "@civilio/shared";
import { FormItemType } from "@db/schemas";

const prefix = "[form]";

export class AddFormItem {
	static type = `${prefix} add form item`
	constructor(readonly type: FormItemType, readonly formVersion: string, readonly parentId?: string) { }
}

export class SetFormType {
	static type = `${prefix} set form type`;

	constructor(readonly form: FormType) {
	}
}
