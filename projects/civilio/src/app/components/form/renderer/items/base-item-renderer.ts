import { Component, computed, input } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { NewFormItemDefinition } from "@civilio/sdk/models";

@Component({
	selector: "cv-base-item-renderer",
	template: "",
})
export class BaseItemRenderer<T extends NewFormItemDefinition, V> {
	readonly itemDefinition = input.required<T>();
	readonly field = input.required<FieldTree<V>>();
	readonly index = input.required<number>();

	protected readonly path = computed(() => this.itemDefinition().path);
}
