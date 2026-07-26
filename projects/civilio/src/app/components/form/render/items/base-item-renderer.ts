import { Component, computed, input, TemplateRef } from "@angular/core";
import { Strict } from "@civilio/shared";
import { FormItem } from "@db/schemas";
import { createRenderedFormItemContextInjector } from "./context";

@Component({
	selector: 'cv-base-item-renderer',
	template: ''
})
export abstract class BaseItemRenderer<T extends Strict<FormItem>> {
	readonly itemDefinition = input.required<T>();
	readonly index = input.required<number>();
	readonly fallbackContent = input<TemplateRef<any>>();
	readonly _ = input<any>(undefined, { alias: 'form' })

	protected readonly formItemContextInjector = createRenderedFormItemContextInjector({
		definition: this.itemDefinition,
	});

	protected readonly path = computed(() => this.itemDefinition().path);
}

@Component({
	selector: "cv-base-data-item-renderer",
	template: ``,
})
export abstract class DataItemRenderer<TItem extends Strict<FormItem>, TData> extends BaseItemRenderer<TItem> {

}


