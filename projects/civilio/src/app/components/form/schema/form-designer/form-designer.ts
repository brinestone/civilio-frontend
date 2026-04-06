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
import { Component, computed, model, Type } from "@angular/core";
import { FieldTree, form } from "@angular/forms/signals";
import { stripSymbols } from "@app/util";
import { defaultFormItemDefinitionSchemaValue, defineFormDesignerFormSchema, FormItem, formItemPathSeparator, FormItemType, FormModel, isExistingFormItem, isFieldTree, isGroup, walkFormItemTree } from "@app/components/form/schema/form-designer-config";
import { FormItemDefinition, FormItemField, FormItemGroup, FormVersionDefinition, NewFormItemDefinition, NewFormItemField, NewFormItemGroup, RelevanceLogicExpression } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideGrip } from "@ng-icons/lucide";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { flatten } from 'flat';
import { current, produce } from "immer";
import { difference, get, isEqual, omit, remove } from "lodash";
import { createFormSchemaContextInjector } from "../items";

type FormItemAddTarget = FieldTree<FormModel> | FieldTree<FormItemGroup>;

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
	readonly formData = model.required<Strict<FormVersionDefinition>>({alias: 'formDefinition'});
	protected readonly formModel = form(this.formData, defineFormDesignerFormSchema());

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
		const { items } = this.formData();
		const reg = {} as Record<
			string,
			FieldTree<Strict<FormItemField | NewFormItemField>>
		>;
		for (const i of items) {
			walkFormItemTree(i, (item) => {
				const tree = get(
					this.formModel.items,
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
	});


	protected onFormItemsReordered({
		container,
		previousContainer,
		currentIndex,
		previousIndex,
	}: CdkDragDrop<FieldTree<Strict<FormItem>[]>>) {
		this.formData.update((v) =>
			produce(v, (draft) => {
				moveItemInArray(draft.items, previousIndex, currentIndex);
			}),
		);
		this.computeItemPaths();
	}

	public addFormItem(type: FormItemType) {
		this._addFormItem(type, this.formModel);
	}

	protected _addFormItem(type: FormItemType, target: FormItemAddTarget) {
		const isGroup = (
			t: FormItemAddTarget,
		): t is FieldTree<Strict<FormItemGroup>> => "children" in t().value();
		const isRoot = (t: FormItemAddTarget): t is FieldTree<FormModel> =>
			"items" in t().value();
		if (isGroup(target)) {
			target().value.update((state) =>
				produce(state, (draft) => {
					const {
						path: parentPath,
						config: { fields },
					} = current(draft);
					const path = [parentPath, "config", "fields", fields.length].join(
						formItemPathSeparator,
					);
					const item = defaultFormItemDefinitionSchemaValue(
						path,
						"field",
					) as Strict<NewFormItemField>;

					draft.config.fields.push(item as any);
				}),
			);
		} else if (isRoot(target)) {
			target().value.update((state) =>
				produce(state, (draft) => {
					const path = `${current(draft).items.length}`;
					const item = defaultFormItemDefinitionSchemaValue(
						path,
						type,
					) as Strict<NewFormItemDefinition>;
					draft.items.push(item as any);
				}),
			);
		}
		this.computeItemPaths();
		this.formModel().markAsDirty();
	}

	protected onRemoveFormItem(path: string, index: number) {
		const segments = path.split(formItemPathSeparator);
		const target = (
			segments.length == 1
				? this.formModel.items
				: get(this.formModel.items, segments.slice(0, -1))
		) as FieldTree<FieldTree<Strict<FormItemDefinition>>[]>;
		if (!target) return;
		target().value.update((state) =>
			produce(state, (draft) => {
				draft.splice(index, 1);
			}),
		);
		this.removeDependentRelevanceExpressionsFor(path);
		this.computeItemPaths();
		this.formModel().markAsDirty();
	}

	private computeItemPaths() {
		let changed = false;
		for (let i = 0; i < this.formModel.items.length; i++) {
			const item = this.formModel.items[i];
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
					if (!pathsEquals) {
						this.updateRelevanceExpressionFieldPathsFor(
							oldChildPath,
							newChildPath,
						);
					}
					changed ||= !pathsEquals;
					field.path().value.set(newChildPath);
				}
			} else if (!pathsEquals) {
				this.updateRelevanceExpressionFieldPathsFor(oldPath, newPath);
			}
			item.path().value.set(newPath);
		}
		if (changed) {
			this.formModel().markAsDirty();
		}
	}

	private updateRelevanceExpressionFieldPathsFor(
		oldPath: string,
		newPath: string,
	) {
		debugger;
		const dependentRelevanceExpressionPaths =
			this.findDependentRelevanceExpressionPathsFor(oldPath);
		for (const expPath of dependentRelevanceExpressionPaths) {
			const expTree = get(
				this.formModel.items,
				expPath,
			) as unknown as FieldTree<Strict<RelevanceLogicExpression>>;
			expTree.field().value.set(newPath);
		}
	}

	private findDependentRelevanceExpressionPathsFor(path: string) {
		const relevancePaths = new Set<string>();
		for (const item of this.formModel.items().value()) {
			walkFormItemTree(item, (i) => {
				if (i.path == path) return;
				i.relevance.logic
					.map((c, i) => [c, i] as const)
					.filter(([c]) => c.expressions.some((e) => e.field == path))
					.map(([c, conditionIndex]) => {
						let cnt = 0;
						for (const expression of c.expressions) {
							if (expression.field != path)
								relevancePaths.add(
									[
										i.path,
										"relevance",
										"logic",
										conditionIndex,
										"expressions",
										cnt,
									].join(formItemPathSeparator),
								);
							cnt++;
						}
					});
			});
		}
		return [...relevancePaths];
	}

	private removeDependentRelevanceExpressionsFor(path: string) {
		for (const item of this.formModel.items) {
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
									(e) => e.field == path,
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
							(e) => e.field == path,
						);
					}),
				);
			}
		}
	}

	private findNewItems() {
		const newItems = Array<string>();
		for (const i of (this.formData()?.items as Strict<FormItem>[]) ??
			Array<Strict<FormItem>>()) {
			walkFormItemTree(i, (item) => {
				if (!isExistingFormItem(item)) {
					newItems.push(item.path);
				}
			});
		}
		return newItems;
	}

	private findUpdatedItems() {
		const updatedItems = Array<string>();
		for (const i of this.formData().items) {
			walkFormItemTree(i, (item) => {
				if (isExistingFormItem(item)) {
					const pristineItem = get(
						this.formData()?.items ?? [],
						item.path,
					) as Strict<FormItemDefinition>;
					if (!pristineItem) return;
					const itemClone = stripSymbols(item);
					const pristineClone = stripSymbols(pristineItem);
					const flatClone = flatten(itemClone);
					let flatPristine = flatten(pristineClone);
					if (isGroup(pristineItem)) {
						const stripped = omit(pristineItem, ["config.fields"]);
						flatPristine = flatten(stripped);
					}

					const equals = isEqual(flatPristine, flatClone);
					if (!equals) {
						updatedItems.push(item.path);
					}
				}
			});
		}
		return updatedItems;
	}

	private findDeletedItems() {
		const existingItems = new Set<string>();
		const originalItems = new Set<string>();
		for (const i of (this.formData()?.items ??
			[]) as unknown as Strict<FormItem>[]) {
			walkFormItemTree(i, (item) => {
				if (!isExistingFormItem(item)) return;
				existingItems.add(item.id);
			});
		}
		for (const i of (this.formData()
			?.items as Strict<FormItemDefinition>[]) ?? []) {
			walkFormItemTree(i, (item) => {
				if (!isExistingFormItem(item)) return;
				originalItems.add(item.id);
			});
		}

		const deletedItems = difference([...originalItems], [...existingItems]);
		return deletedItems;
	}
}
