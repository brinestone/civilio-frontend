import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DatePipe } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, HostListener, input, linkedSignal, model, numberAttribute, signal, untracked } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideX } from '@ng-icons/lucide';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { ButtonVariants, HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroupImports } from '@spartan-ng/helm/button-group';
import { HlmCalendarMulti } from '@spartan-ng/helm/calendar';
import { HlmIcon } from "@spartan-ng/helm/icon";
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { hlm } from '@spartan-ng/helm/utils';
import { ClassValue } from 'clsx';
import { isDate } from 'date-fns';
import { last } from 'lodash';

let nextId = 0;
function toNumericalDate(arg: unknown) {
	switch (typeof arg) {
		case 'string': return Date.parse(arg);
		case 'number': return new Date(arg).valueOf();
		case 'object': return isDate(arg) ? arg.valueOf() : undefined;
		default: return undefined;
	}
}
function toDate(arg: number | undefined | null) {
	if (arg === null || arg === undefined) return undefined;
	return new Date(arg);
}
@Component({
	selector: 'multi-date-picker',
	viewProviders: [
		provideIcons({
			lucideChevronDown,
			lucideX
		})
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		HlmButtonGroupImports,
		HlmPopoverImports,
		BrnPopoverImports,
		HlmCalendarMulti,
		NgIcon,
		DatePipe,
		HlmButton,
		HlmIcon
	],
	host: {
		class: 'group/multi-date-picker',
		'[class.ng-invalid]': 'invalid()',
		'[class.ng-valid]': 'valid()',
		'[class.ng-touched]': 'touched()',
		'[class.ng-untouched]': '!touched()',
		'[class.ng-dirty]': 'dirty()',
		'[class.ng-pristine]': '!dirty()',
		'[class.ng-pending]': 'pending()',
		'[attr.aria-invalid]': 'invalid()',
		'[attr.aria-valid]': 'valid()',
		'[attr.aria-touched]': 'touched()',
		'[attr.aria-untouched]': '!touched()',
		'[attr.aria-dirty]': 'dirty()',
		'[attr.aria-pristine]': '!dirty()',
		'[attr.aria-pending]': 'pending()',
	},
	templateUrl: './mult-date-picker.component.html',
	styleUrl: './mult-date-picker.component.scss',
})
export class MultiDatePicker implements FormValueControl<number[] | null | undefined> {

	public readonly dirty = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly pending = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly value = model<number[] | null | undefined>();
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly buttonId = input<string>(`multi-date-picker-${++nextId}`, { alias: 'id' });
	public readonly captionLayout = input<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('label');
	public readonly min = input<number | undefined, unknown>(undefined, { transform: toNumericalDate });
	public readonly max = input<number | undefined, unknown>(undefined, { transform: toNumericalDate });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly minSelection = input<number, NumberInput>(undefined, { transform: numberAttribute });
	public readonly maxSelection = input<number, NumberInput>(undefined, { transform: numberAttribute });
	public readonly autoCloseOnSelection = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly clearable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	public readonly valid = computed(() => !this.invalid());
	public readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly touched = model<boolean>(false);
	public readonly size = input<ButtonVariants['size']>('default');

	protected readonly mutableValue = linkedSignal(() => {
		const value = this.value();
		if (value === null || value === undefined || value.length == 0) return [];
		return value.sort().map(n => new Date(n));
	});
	protected readonly popoverState = signal<BrnDialogState>('closed');
	protected readonly computedClass = computed(() => hlm(
		'flex justify-between w-70 items-center group-[:is(.ng-invalid)]/multi-date-picker:border-destructive! group-[:is(.ng-invalid)]/multi-date-picker:text-destructive! group-[:is(.ng-invalid)]/multi-date-picker:ring-destructive/40!',
		this.userClass()
	));
	protected readonly minDate = computed(() => toDate(this.min()));
	protected readonly maxDate = computed(() => toDate(this.max()));

	constructor() {
		effect(() => {
			const min = this.min();
			const value = untracked(this.value);
			if (min === undefined || !value || value.length == 0) return;
			const diff = value[0] - min;
			if (diff >= 0) return;
			this.value.set(value.filter(n => n >= min).sort());
		});
		effect(() => {
			const max = this.min();
			const value = untracked(this.value);
			if (max === undefined || !value || value.length == 0) return;
			const diff = last(value)!.valueOf() - max;
			if (diff < 0) return;
			this.value.set(value.filter(n => n <= max).sort());
		});
	}

	public open() {
		this.popoverState.set('open');
	}

	public close() {
		this.popoverState.set('closed');
	}

	protected onClearButtonClicked() {
		this.value.set([]);
	}
	protected onSelectionChanged(update?: Date[]) {
		this.value.set(update?.map(d => d.valueOf()).sort() ?? []);
	}
	@HostListener('click')
	protected onClicked() {
		this.touched.set(true);
	}
}
