import { Component, computed, input } from "@angular/core";
import { Strict } from "@civilio/shared";
import { createRenderedFormItemContextInjector } from "./context";
import { FormItemEntity } from "@db/types";

@Component({
	selector: "cv-base-item-renderer",
	template: "",
})
export class BaseItemRenderer<T extends Strict<FormItemEntity>, V> {
	readonly itemDefinition = input.required<T>();
	readonly index = input.required<number>();

	protected readonly formItemContextInjector = createRenderedFormItemContextInjector({
		definition: this.itemDefinition,
	});

	protected readonly path = computed(() => this.itemDefinition().path);
}
