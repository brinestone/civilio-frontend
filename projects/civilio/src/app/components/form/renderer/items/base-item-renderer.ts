import { Component, computed, inject, input } from "@angular/core";
import { FormItemDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { createRenderedFormItemContextInjector } from "./context";
import { FormGroupDirective } from "@angular/forms";

@Component({
	selector: "cv-base-item-renderer",
	template: "",
})
export class BaseItemRenderer<T extends Strict<FormItemDefinition>, V> {
	readonly itemDefinition = input.required<T>();
	readonly index = input.required<number>();

	protected readonly formItemContextInjector = createRenderedFormItemContextInjector({
		definition: this.itemDefinition,
	});

	protected readonly path = computed(() => this.itemDefinition().path);
}
