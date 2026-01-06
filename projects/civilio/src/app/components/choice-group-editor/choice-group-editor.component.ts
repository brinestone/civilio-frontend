import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, ElementRef, input, linkedSignal, model, signal, untracked, viewChild } from '@angular/core';
import { applyEach, Field, form, required, validate } from '@angular/forms/signals';
import { BaseFormValueControl } from '@app/adapters/forms/base-form-value-control';
import { randomString } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronUp, lucideMenu, lucidePlus, lucideRefreshCw, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldGroup, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';

type GroupValue = {
	group: string;
	items: {
		i18n_key: string | null;
		label: string;
		name: string;
		parent: string | null;
		isNew: boolean;
	}[],
	// Symbol: Symbol
};

@Component({
	selector: 'cv-group-choice-editor',
	viewProviders: [
		provideIcons({
			lucidePlus,
			lucideMenu,
			lucideChevronDown,
			lucideChevronUp,
			lucideRefreshCw,
			lucideTrash2
		})
	],
	imports: [
		HlmFieldImports,
		Field,
		NgClass,
		CdkDropList,
		HlmLabel,
		CdkDragPlaceholder,
		CdkDragHandle,
		HlmSwitchImports,
		CdkDrag,
		NgTemplateOutlet,
		HlmButton,
		NgIcon,
		HlmInput,
	],
	templateUrl: './choice-group-editor.component.html',
	styleUrl: './choice-group-editor.component.scss',
	// providers: [
	// 	{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChoiceGroupEditorComponent), multi: true }
	// ],
	hostDirectives: [
		HlmFieldGroup
	]
})
export class ChoiceGroupEditorComponent extends BaseFormValueControl<GroupValue> {
	private togglePanel = viewChild.required<ElementRef<HTMLDivElement>>('togglePanel');
	protected readonly key = randomString();
	protected readonly expanded = signal(false);
	override readonly disabled = input(false, { transform: booleanAttribute });
	readonly value = model.required<GroupValue>();
	protected readonly newItems = signal<GroupValue['items']>([]);
	protected readonly _value = linkedSignal(() => ({ ...this.value(), items: [...this.value().items.map(v => ({ ...v, isNew: false })), ...this.newItems()] }));
	protected formModel = form(this._value, paths => {
		required(paths.group, { message: 'This field is required' });
		applyEach(paths.items, innerPaths => {
			required(innerPaths.label, { message: 'This field is required' });
			required(innerPaths.name, { message: 'This field is required' });
		});
		validate(paths.items, (items) => {
			const labels = items.value()
				.map(i => i.label)
				.filter(l => !!l)
				.map(v => v.trim());
			const hasDuplicates = new Set(labels).size !== labels.length;
			if (!hasDuplicates) return null;
			return { message: 'Labels must be unique', kind: 'uniqueLabel' };
		})
	});
	protected optionsSequential = linkedSignal(() => {
		const items = this._value().items;
		const values = items.map(i => Number(i.name));
		if (values.some(v => isNaN(v))) {
			return false;
		}

		const min = Math.min(...values);
		const max = Math.max(...values);

		const isSpreadValid = (max - min) === (items.length - 1);
		const hasNoDuplicates = new Set(values).size === items.length;

		return isSpreadValid && hasNoDuplicates;
	});
	protected newItemsOffsetIndex = computed(() => {
		return this.value().items.length;
	})

	protected toggleExpanded({ currentTarget, target, type }: MouseEvent) {
		if (
			(type == 'click' && target instanceof HTMLButtonElement) ||
			(type == 'dblclick' && currentTarget === target && this.togglePanel().nativeElement)
		)
			this.expanded.update(v => !v);
	}
	protected onItemReOrdererd(event: CdkDragDrop<GroupValue['items']>) {
		this.value.update(g => {
			const copy = [...g.items];
			moveItemInArray(copy, event.previousIndex, event.currentIndex);
			return { ...g, items: copy };
		})
	}
	protected onNewItemReOrdered(event: CdkDragDrop<GroupValue['items']>) {
		this.newItems.update(g => {
			const copy = [...g];
			const offset = this.newItemsOffsetIndex();
			const prev = event.previousIndex - offset;
			const curr = event.currentIndex - offset;
			moveItemInArray(copy, prev, curr);
			return { ...g, items: copy };
		});
	}
	protected onDeleteOptionButtonClicked(index: number) {
		const items = this._value().items;
		const itemToDelete = items[index];

		if (itemToDelete.isNew) {
			const relativeIndex = index - this.newItemsOffsetIndex();
			this.newItems.update(v => {
				const copy = [...v];
				copy.splice(relativeIndex, 1);
				return copy;
			});
		} else {
			this.value.update(v => {
				const copy = [...v.items];
				copy.splice(index, 1);
				return { ...v, items: copy };
			});
		}
	}
	private nextSequenceValue() {
		const items = this._value().items;
		const values = items.map(i => Number(i.name));
		if (values.some(v => isNaN(v))) {
			return String(0);
		}

		const max = Math.max(...values);
		return String(max + 1);
	}
	protected onAddOptionButtonClicked() {
		this.newItems.update(v => {
			const isSequential = untracked(this.optionsSequential);
			const value = isSequential ? this.nextSequenceValue() : '';
			return [
				{
					i18n_key: null,
					label: value,
					name: value,
					parent: null,
					isNew: true
				},
				...v,
			]
		})
	}
}
