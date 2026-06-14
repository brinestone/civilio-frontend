import {
	CdkDrag,
	CdkDragDrop,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDragPreview,
	CdkDropList
} from "@angular/cdk/drag-drop";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import { Component, computed, input, output, Type } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { FormItemEntity, FormItemType } from "@app/components/form/schema/form-designer-config";
import { FormItemField, NewFormItemField } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideGrip } from "@ng-icons/lucide";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { createFormSchemaContextInjector } from "../items";

export type ItemReorderedEvent = { startIndex: number; endIndex: number };

@Component({
	selector: "cv-form-designer",
	templateUrl: "./form-designer.html",
	viewProviders: [
		provideIcons({
			lucideGrip
		})
	],
	imports: [
		HlmFieldImports,
		CdkDropList,
		CdkDrag,
		CdkDragHandle,
		CdkDragPlaceholder,
		CdkDragPreview,
		NgIcon,
		AsyncPipe,
		NgComponentOutlet,
	],
})
export class FormDesigner {
	readonly formItems = input.required<FieldTree<Strict<FormItemEntity>[]>>();
	readonly libAdd = output<string>();
	readonly libRemove = output<string>();
	readonly onItemRemoved = output<string>();
	readonly itemreordered = output<ItemReorderedEvent>();

	protected readonly itemTypeNames = {
		question: "Question",
	} as Record<FormItemType, string>;
	protected readonly formItemComponents = {
		question:
			import("../../../../components/form/schema/items/field-item-schema-designer/field-item-schema-designer").then(
				(m) => m.FieldItemSchemaDesigner,
			),
	} as Record<string, Promise<Type<any>>>;

	protected readonly fieldItems = computed(() => {
		const items = this.formItems()().value();
		const reg = {} as Record<
			string,
			FieldTree<Strict<FormItemField | NewFormItemField>>
		>;
		// for (const i of items) {
		// 	walkFormItemTree(i, (item) => {
		// 		const tree = get(
		// 			this.items(),
		// 			item.path.split(formItemPathSeparator),
		// 		) as FieldTree<Strict<FormItemDefinition>>;
		// 		if (isFieldTree(tree) && tree().valid()) {
		// 			reg[item.path] = tree;
		// 		}
		// 	});
		// }
		return reg;
	});
	protected readonly itemComponentInjector = createFormSchemaContextInjector({
		itemDeleteHandler: this.onRemoveFormItem.bind(this),
		allFields: this.fieldItems,
		libraryToggleHandler: this.toggleLibraryStatus.bind(this)
	});

	protected toggleLibraryStatus(itemId: string) {

	}

	protected onFormItemsReordered({
		currentIndex,
		previousIndex,
	}: CdkDragDrop<FieldTree<Strict<FormItemEntity>[]>>) {
		this.itemreordered.emit({ endIndex: currentIndex, startIndex: previousIndex });
	}

	protected onRemoveFormItem(id: string) {
		this.onItemRemoved.emit(id);
	}

}
