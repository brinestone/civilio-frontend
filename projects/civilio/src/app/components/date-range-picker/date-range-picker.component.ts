import { BooleanInput } from '@angular/cdk/coercion';
import { DatePipe } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, input, linkedSignal, model, output, signal, untracked } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideX } from '@ng-icons/lucide';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { ButtonVariants, HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroupImports } from '@spartan-ng/helm/button-group';
import { HlmCalendarRange } from '@spartan-ng/helm/calendar';
import { injectHlmDateRangePickerConfig } from '@spartan-ng/helm/date-picker';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { hlm } from '@spartan-ng/helm/utils';
import { ClassValue } from 'clsx';
import { isDate } from 'date-fns';

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
		HlmCalendarRange
	],
	host: {
		'class': 'group/date-range-picker'
	},
	templateUrl: './date-range-picker.component.html',
	styleUrl: './date-range-picker.component.scss',
})
export class DateRangePickerComponent<T> implements FormValueControl<undefined | null | [T | null, T | null]> {
	private readonly config = injectHlmDateRangePickerConfig<T>();

	// public readonly rangeChanged = output<[T | null, T | null]>();
	public readonly value = model<[T | null, T | null] | undefined | null>([null, null]);
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	public readonly buttonId = input<string>(`date-range-picker-${++nextId}`, { alias: 'id' });
	public readonly captionLayout = input<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('label');
	public readonly min = input<number | undefined, unknown>(undefined, { transform: toNumericalDate })
	public readonly max = input<number | undefined, unknown>(undefined, { transform: toNumericalDate })
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly autoCloseOnEndSelection = input<boolean, BooleanInput>(this.config.autoCloseOnEndSelection, { transform: booleanAttribute });
	public readonly size = input<ButtonVariants['size']>('default');
	public readonly clearable = input<boolean, unknown>(false, { transform: booleanAttribute });

	protected readonly minDate = computed(() => toDate(this.min()));
	protected readonly maxDate = computed(() => toDate(this.max()));
	protected readonly start = linkedSignal(() => {
		const value = this.value();
		if (!value) return undefined;
		const [target] = value;
		return target;
	});
	protected readonly end = linkedSignal(() => {
		const value = this.value();
		if (!value) return undefined;
		const [_, target] = value;
		return target;
	});
	protected readonly computedClass = computed(() => hlm(
		'grid grid-cols-[1fr_auto] w-70 items-center',
		this.userClass()
	));
	protected readonly transformDates = input<(date: [T, T]) => [T, T]>(this.config.transformDates);
	protected readonly popoverState = signal<BrnDialogState>('closed');


	constructor() {
		effect(() => {
			const min = this.min();
			const start = untracked(this.start);
			if (min === undefined || !start) return;
			const startDate = start as unknown as Date;
			const diff = startDate.valueOf() - min;
			if (diff > 0) return;
			this.value.set(untracked(this.transformDates)([new Date(min) as unknown as T, untracked(this.end) as T]))
		});
	}

	public open() {
		this.popoverState.set('open');
	}

	public close() {
		this.popoverState.set('closed');
	}

	protected onStartDayChanged(value: T) {
		this.start.set(value as any);
	}
	protected onEndDayChanged(value: T) {
		this.end.set(value as any);
		if (this.disabled()) return;

		const start = this.start();
		if (!start || !value) return;
		const transformedDates = this.transformDates()([start, value]);
		this.value.set(transformedDates);
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
}
