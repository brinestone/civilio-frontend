import {
	CdkDrag,
	CdkDragDrop,
	CdkDragHandle,
	CdkDragPlaceholder,
	CdkDragPreview,
	CdkDropList,
	moveItemInArray,
} from "@angular/cdk/drag-drop";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import { Component, computed, input, output, Type } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { defaultFormItemDefinitionSchemaValue, FormItem, formItemPathSeparator, FormItemType, FormModel, isFieldTree, walkFormItemTree } from "@app/components/form/schema/form-designer-config";
import { FormItemDefinition, FormItemField, FormItemGroup, FormVersionDefinition, HasLibraryStatus, NewFormItemDefinition, NewFormItemField, NewFormItemGroup } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideGrip } from "@ng-icons/lucide";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { current, produce } from "immer";
import { get, remove } from "lodash";
import { createFormSchemaContextInjector } from "../items";

function hasLibraryStatus(item: FieldTree<Strict<any>>): item is FieldTree<Strict<HasLibraryStatus>> {
	return 'inLibrary' in item;
}

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
	readonly formModel = input.required<FieldTree<Strict<FormVersionDefinition>>>();
	readonly libAdd = output<string>();
	readonly libRemove = output<string>();

	protected readonly itemTypeNames = {
		field: "Question",
		separator: "Separator",
		group: "Group",
		image: "Image",
		note: "Note",
	} as Record<FormItemType, string>;
	protected readonly formItemComponents = {
		field:
			import("../../../../components/form/schema/items/field-item-schema-designer/field-item-schema-designer").then(
				(m) => m.FieldItemSchemaDesigner,
			),
		group:
			import("../../../../components/form/schema/items/group-schema-designer/group-schema-designer").then(
				(m) => m.GroupSchemaDesigner,
			),
	} as Record<string, Promise<Type<any>>>;

	protected readonly fieldItems = computed(() => {
		const { items } = this.formModel()().value();
		const reg = {} as Record<
			string,
			FieldTree<Strict<FormItemField | NewFormItemField>>
		>;
		for (const i of items) {
			walkFormItemTree(i, (item) => {
				const tree = get(
					this.formModel().items,
					item.path.split(formItemPathSeparator),
				) as FieldTree<Strict<FormItemDefinition>>;
				if (isFieldTree(tree) && tree().valid()) {
					reg[item.path] = tree;
				}
			});
		}
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
		container,
		previousContainer,
		currentIndex,
		previousIndex,
	}: CdkDragDrop<FieldTree<Strict<FormItem>[]>>) {
		this.formModel()().value.update((v) =>
			produce(v, (draft) => {
				moveItemInArray(draft.items, previousIndex, currentIndex);
			}),
		);
		this.computeItemPaths();
	}


	public handleNewItemAdded(type: FormItemType) {
		this.formModel()().value.update((state) =>
			produce(state, (draft) => {
				const path = `${current(draft).items.length}`;
				const item = defaultFormItemDefinitionSchemaValue(
					path,
					type,
				) as Strict<NewFormItemDefinition>;
				draft.items.push(item as any);
			}),
		);
		this.computeItemPaths();
		this.formModel()().markAsDirty();
	}

	protected onRemoveFormItem(path: string, index: number) {
		const segments = path.split(formItemPathSeparator);
		const target = (
			segments.length == 1
				? this.formModel().items
				: get(this.formModel().items, segments.slice(0, -1))
		) as FieldTree<FieldTree<Strict<FormItemDefinition>>[]>;
		if (!target) return;

		target().value.update((state) =>
			produce(state, (draft) => {
				draft.splice(index, 1);
			}),
		);
		this.removeDependentRelevanceExpressionsFor(path);
		this.computeItemPaths();
		this.formModel()().markAsDirty();
	}

	private computeItemPaths() {
		let changed = false;
		for (let i = 0; i < this.formModel().items.length; i++) {
			const item = this.formModel().items[i];
			const newPath = String(i);
			const oldPath = item.path().value();
			const pathsEquals = newPath === oldPath;
			changed ||= !pathsEquals;
			if (item.type().value() == "group") {
				const config = item.config as unknown as FieldTree<
					Strict<FormItemGroup | NewFormItemGroup>["config"]
				>;
				for (let j = 0; j < config.fields.length; j++) {
					const field = config.fields[j];
					const newChildPath = [newPath, "config", "fields", String(j)].join(
						formItemPathSeparator,
					);
					const oldChildPath = field.path().value();
					const pathsEquals = newChildPath === oldChildPath;
					changed ||= !pathsEquals;
					field.path().value.set(newChildPath);
				}
			}
			item.path().value.set(newPath);
		}
		if (changed) {
			this.formModel()().markAsDirty();
		}
	}

	private removeDependentRelevanceExpressionsFor(dataKey: string) {
		for (const item of this.formModel().items) {
			if (item.type().value() == "group") {
				const config = item.config as unknown as FieldTree<
					Strict<FormItemGroup | NewFormItemGroup>["config"]
				>;
				for (const field of config.fields) {
					for (const logic of field.relevance.logic) {
						logic().value.update((v) =>
							produce(v, (draft) => {
								draft.expressions = remove(
									current(draft).expressions,
									(e) => e.field == dataKey,
								);
							}),
						);
					}
				}
			}
			for (const logic of item.relevance.logic) {
				logic().value.update((v) =>
					produce(v, (draft) => {
						draft.expressions = remove(
							current(draft).expressions,
							(e) => e.field == dataKey,
						);
					}),
				);
			}
		}
	}

}
