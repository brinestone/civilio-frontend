import { BooleanInput } from '@angular/cdk/coercion';
import { DatePipe } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, HostListener, input, linkedSignal, model, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { NumberRange } from '@civilio/sdk/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideX } from '@ng-icons/lucide';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { ButtonVariants, HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroupImports } from '@spartan-ng/helm/button-group';
import { HlmCalendarRange } from '@spartan-ng/helm/calendar';
import { HlmIcon } from "@spartan-ng/helm/icon";
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { hlm } from '@spartan-ng/helm/utils';
import { ClassValue } from 'clsx';
import { isDate } from 'date-fns';
import { produce, setAutoFreeze } from 'immer';

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
	selector: 'date-range-picker',
	viewProviders: [
		provideIcons({
			lucideChevronDown,
			lucideX
		})
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		BrnPopoverImports,
		HlmPopoverImports,
		HlmButtonGroupImports,
		DatePipe,
		HlmButton,
		NgIcon,
		HlmCalendarRange,
		HlmIcon
	],
	host: {
		'class': 'group/date-range-picker',
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
	templateUrl: './date-range-picker.component.html',
	styleUrl: './date-range-picker.component.scss',
})
export class DateRangePickerComponent implements FormValueControl<undefined | null | NumberRange>, OnInit, OnDestroy {
	public readonly value = model<NumberRange | undefined | null>(undefined);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly buttonId = input<string>(`date-range-picker-${++nextId}`, { alias: 'id' });
	public readonly captionLayout = input<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('label');
	public readonly min = input<number | undefined, unknown>(undefined, { transform: toNumericalDate })
	public readonly max = input<number | undefined, unknown>(undefined, { transform: toNumericalDate })
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly autoCloseOnEndSelection = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	public readonly size = input<ButtonVariants['size']>('default');
	public readonly clearable = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly valid = computed(() => !this.invalid());
	public readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly dirty = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly touched = model<boolean>(false);
	public readonly pending = model<boolean>(false);

	protected readonly minDate = computed(() => toDate(this.min()));
	protected readonly maxDate = computed(() => toDate(this.max()));
	protected readonly start = linkedSignal(() => toDate(this.value()?.start));
	protected readonly end = linkedSignal(() => toDate(this.value()?.end));
	protected readonly computedClass = computed(() => hlm(
		'flex justify-between w-70 items-center group-[:is(.ng-invalid)]/date-range-picker:border-destructive! group-[:is(.ng-invalid)]/date-range-picker:text-destructive! group-[:is(.ng-invalid)]/date-range-picker:ring-destructive/40!',
		this.userClass()
	));
	protected readonly popoverState = signal<BrnDialogState>('closed');


	constructor() {
		effect(() => {
			const min = this.min();
			const start = untracked(this.start);
			if (min === undefined || !start) return;
			const diff = start.valueOf() - min;
			if (diff > 0) return;
			this.value.update(v => produce(v ?? { start: null, end: null }, draft => {
				draft.start = min;
			}))
		});
		effect(() => {
			const max = this.max();
			const end = untracked(this.end);
			if (max === undefined || !end) return;
			const diff = end.valueOf() - max;
			if (diff < 0) return;
			this.value.update(v => produce(v ?? { start: null, end: null }, draft => {
				draft.end = max;
			}));
		});
	}
	ngOnDestroy() {
	}
	ngOnInit() {
		setAutoFreeze(false);
	}

	public open() {
		this.popoverState.set('open');
	}

	public close() {
		this.popoverState.set('closed');
	}

	protected onStartDayChanged(value: Date) {
		this.start.set(value);
	}
	protected onEndDayChanged(value: Date) {
		this.end.set(value);
		if (this.disabled()) return;

		const start = this.start();
		if (!start || !value) return;
		this.value.update(v => produce(v ?? { start: null, end: null }, draft => {
			draft.end = this.end()?.valueOf() ?? null;
			draft.start = this.start()?.valueOf() ?? null;
		}));
		if (this.autoCloseOnEndSelection()) {
			this.close();
		}
	}
	protected onPopoverClosed() {
		// const dates = this.value();
		// if (this.start() && !this.end() && dates) {
		// 	this.start.set(dates[0] as any);
		// 	this.end.set(dates[1] as any);
		// }
	}
	@HostListener('click')
	protected onClicked() {
		this.touched.set(true);
	}
}
