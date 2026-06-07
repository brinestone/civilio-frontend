import { Component, computed } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { FieldItemConfig } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { FormItemEntity } from "../../form-designer-config";
import { injectFormItemDesignerContext } from "../../items";

@Component({
	selector: 'cv-base-meta-config',
	template: ''
})
export class BaseFieldConfig<T extends FieldItemConfig> {
	protected readonly ctx = injectFormItemDesignerContext<FormItemEntity>();
	protected readonly meta = computed(() => {
		const item = this.ctx.fieldTree();
		return item.config as unknown as FieldTree<Strict<T>>;
	});
	protected readonly index = this.ctx.index;
	protected readonly path = computed(() => {
		const item = this.ctx.fieldTree();
		return item.path().value();
	})
	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}
}
