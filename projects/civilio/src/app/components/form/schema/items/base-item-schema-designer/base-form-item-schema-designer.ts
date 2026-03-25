import { BooleanInput } from "@angular/cdk/coercion";
import { CdkDrag, CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, isDevMode, model } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { FormItemDefinition, NewFormItemDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { createFormItemDesignerContextInjector, injectFormSchemaContext } from "..";

@Component({
	selector: 'base-form-item',
	template: `
		<div *cdkDragPlaceholder class="drag-placeholder"></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CdkDragPlaceholder],
	hostDirectives: [
		{
			directive: CdkDrag,
			inputs: ['cdkDragLockAxis']
		}
	],
	host: {
		'[class.group/form-item]': 'true',
		'[class.relative]': 'true',
		// '[class.border-primary!]': '_selected()'
	},
	styleUrl: './base-form-item-schema-designer.scss'
})
export class BaseFormItemSchemaDesigner<T extends FormItemDefinition | NewFormItemDefinition> {
	readonly node = input.required<FieldTree<Strict<T>>>();
	readonly index = input.required<number>();
	readonly selected = model<boolean>(false);
	readonly expanded = model<boolean>(isDevMode())
	readonly editing = model<boolean>(true);
	readonly showDebug = input<boolean, BooleanInput>(isDevMode(), { transform: booleanAttribute });
	protected readonly isNew = computed(() => !('id' in (this.node()().value() as any)));
	protected readonly context = injectFormSchemaContext();
	protected readonly sectionInjector = createFormItemDesignerContextInjector<T>({
		fieldTree: this.node,
		index: this.index,
	});
	protected asGenericControl(node: any) {
		return node as FieldTree<unknown>;
	}
	// protected readonly _selected = linkedSignal(() => {
	// 	return this.context.allItemsSelected();
	// });
	// constructor() {
	// 	effect(() => {
	// 		if (untracked(this.context.allItemsSelected)) return;
	// 		const node = untracked(this.node) as unknown as FieldTree<Strict<NewFormItemDefinition>>;
	// 		this.context.selectionToggledHandler(node.path().value(), this._selected());
	// 	});
	// }
}
