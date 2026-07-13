import { Component, computed, input, TemplateRef } from "@angular/core";
import { Strict } from "@civilio/shared";
import { FormItem } from "@db/schemas";
import { createRenderedFormItemContextInjector } from "./context";

@Component({
	selector: "cv-base-item-renderer",
	template: ``,
})
export class BaseItemRenderer<T extends Strict<FormItem>, V> {
	readonly itemDefinition = input.required<T>();
	readonly index = input.required<number>();
	readonly fallbackContent = input<TemplateRef<any>>();
	readonly _ = input(undefined, { alias: 'form' })

	protected readonly formItemContextInjector = createRenderedFormItemContextInjector({
		definition: this.itemDefinition,
	});

	protected readonly path = computed(() => this.itemDefinition().path);
}
