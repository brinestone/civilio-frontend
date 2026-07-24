import { BooleanInput } from "@angular/cdk/coercion";
import {
	CdkDrag,
	CdkDragDrop,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDragPreview,
	CdkDropList
} from "@angular/cdk/drag-drop";
import { AsyncPipe, NgClass, NgComponentOutlet } from "@angular/common";
import { booleanAttribute, Component, computed, input, output, Type, untracked } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { Strict } from "@civilio/shared";
import { FormItem, FormItemType, QuestionItem } from "@db/schemas";
import { FormItemEntity } from "@db/types";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideGrip } from "@ng-icons/lucide";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { createFormSchemaContextInjector } from "../items";

export type ItemReorderedEvent = { startIndex: number; endIndex: number };

@Component({
	selector: "cv-form-designer",
	templateUrl: "./form-designer.html",
	styleUrl: './form-designer.scss',
	viewProviders: [
		provideIcons({
			lucideGrip
		})
	],
	imports: [
		HlmFieldImports,
		CdkDrag,
		CdkDragHandle,
		CdkDragPlaceholder,
		CdkDragPreview,
		NgIcon,
		AsyncPipe,
		NgComponentOutlet,
		NgClass
	],
	hostDirectives: [
		CdkDropList
	]
})
export class FormDesigner {
	readonly formItems = input.required<FieldTree<Strict<FormItem>[]>>();
	readonly enableDebugPanels = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	readonly libAdd = output<string>();
	readonly libRemove = output<string>();
	readonly onItemRemoved = output<string>();
	readonly itemreordered = output<ItemReorderedEvent>();

	protected readonly itemTypeNames = {
		question: "Question",
	} as Record<FormItemType, string>;
	protected readonly formItemComponents = {
		question:
			import("../items/field-item-designer/field-item-designer").then(
				(m) => m.FieldItemDesigner,
			),
	} as Record<string, Promise<Type<any>>>;

	protected readonly fieldItems = computed(() => {
		const items = this.formItems();
		const reg = {} as Record<
			string,
			FieldTree<Strict<QuestionItem>>
		>;

		for (const i of items) {
			if (untracked(i.type().value) == 'question') {
				const id = untracked(i.id().value);
				reg[id] = i as FieldTree<Strict<QuestionItem>>;
			}
		}
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
