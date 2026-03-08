import { Component, computed, input } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { FieldItemConfig } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";

@Component({
	selector: 'cv-base-meta-config',
	template: ''
})
export class BaseMetaConfigComponent<T extends FieldItemConfig> {
	readonly path = input.required<string>();
	readonly meta = input.required<FieldTree<Strict<T>>>();
	readonly index = input.required<number>();
	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}
}
