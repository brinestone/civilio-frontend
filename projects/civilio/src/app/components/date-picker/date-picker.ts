import { BooleanInput } from "@angular/cdk/coercion";
import { DatePipe, NgClass } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, HostListener, input, linkedSignal, model, OnInit, signal, untracked } from "@angular/core";
import { FormValueControl } from "@angular/forms/signals";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideX } from "@ng-icons/lucide";
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import { BrnPopoverImports } from "@spartan-ng/brain/popover";
import { ButtonVariants, HlmButton } from "@spartan-ng/helm/button";
import { HlmButtonGroupImports } from '@spartan-ng/helm/button-group';
import { HlmCalendar } from "@spartan-ng/helm/calendar";
import { HlmIcon } from "@spartan-ng/helm/icon";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmPopoverImports } from "@spartan-ng/helm/popover";
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';
import { isDate } from "date-fns";


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
	selector: 'cv-date-picker',
	imports: [
		BrnPopoverImports,
		HlmPopoverImports,
		HlmButtonGroupImports,
		HlmCalendar,
		HlmIcon,
		DatePipe,
		NgIcon,
		HlmButton,
		NgClass,
		HlmInput
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	viewProviders: [
		provideIcons({
			lucideChevronDown,
			lucideX
		})
	],
	host: {
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
		class: 'group/date-picker',
	},
	templateUrl: './date-picker.html',
	styleUrl: './date-picker.scss'
})
export class DatePicker implements FormValueControl<number | null | undefined>, OnInit {
	protected readonly today = new Date();
	value = model<number | null>();
	_popoverState = signal<BrnDialogState | null>(null);
	protected readonly dateValue = linkedSignal(() => {
		const value = this.value();
		if (value === undefined || value === null) return new Date(this.today);
		return new Date(value);
	});
	protected readonly mutableTime = linkedSignal(() => {
		const date = this.dateValue();
		const time = date.toTimeString();
		const actualTime = time.substring(0, time.lastIndexOf(':'));
		return actualTime;
	});
	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected readonly _computedClass = computed(() =>
		hlm(
			'flex justify-between items-center group-[:is(.ng-invalid)]/date-picker:border-destructive! group-[:is(.ng-invalid)]/date-picker:text-destructive! group-[:is(.ng-invalid)]/date-picker:ring-destructive/40!',
			this.timePicker() ? 'w-50' : 'w-70',
			this.userClass(),
		),
	);
	public readonly dirty = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly pending = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly valid = computed(() => !this.invalid());
	public readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly touched = model<boolean>(false);
	public readonly buttonId = input<string>(`hlm-date-picker-${++nextId}`, { alias: 'id' });
	public readonly captionLayout = input<'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'>('label');
	public readonly min = input<number | undefined, unknown>(undefined, { transform: toNumericalDate });
	public readonly max = input<number | undefined, unknown>(undefined, { transform: toNumericalDate });
	public readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	public readonly autoCloseOnSelect = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	public readonly timePicker = input<boolean, BooleanInput>(false, { transform: booleanAttribute, alias: 'pickTime' });
	public readonly enableClear = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'clearable' });
	public readonly buttonSize = input<ButtonVariants['size']>('default', { alias: 'size' });
	public open() {
		this._popoverState.set('open');
	}
	protected readonly transformedMin = computed(() => {
		return toDate(this.min());
	})
	protected readonly transformedMax = computed(() => toDate(this.max()));
	protected readonly timeMin = computed(() => {
		const minVal = this.transformedMin();
		const current = this.dateValue() as any;

		if (!minVal || !isDate(current)) return undefined;

		// Only restrict time if the selected date is the SAME as the min date
		const isSameDay = current.toDateString() === minVal.toDateString();
		if (!isSameDay) return undefined;

		return minVal.getHours().toString().padStart(2, '0') + ':' +
			minVal.getMinutes().toString().padStart(2, '0');
	});
	protected readonly timeMax = computed(() => {
		const maxVal = this.transformedMax();
		const current = this.dateValue() as any;

		if (!maxVal || !isDate(current)) return undefined;

		const isSameDay = current.toDateString() === maxVal.toDateString();
		if (!isSameDay) return undefined;

		return maxVal.getHours().toString().padStart(2, '0') + ':' +
			maxVal.getMinutes().toString().padStart(2, '0');
	});
	public close() {
		this._popoverState.set('closed');
	}
	protected _handleDateChange(value: Date) {
		if (this.disabled()) return;

		const newDate = isDate(value) ? value : new Date();
		const current = untracked(this.dateValue);

		// If time picker is enabled and we have a current date, merge the time
		if (this.timePicker() && isDate(current)) {
			newDate.setHours(
				current.getHours(),
				current.getMinutes(),
				current.getSeconds(),
				current.getMilliseconds()
			);
		}

		const transformedDate = newDate.valueOf();
		this.value.set(transformedDate);

		if (this.autoCloseOnSelect()) {
			this.close();
		}
	}
	ngOnInit() {
		this.touched.set(false);
	}
	@HostListener('click')
	onClick() {
		this.touched.set(true);
	}
	protected onTimeInputValueChanged(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		if (this.disabled() || !this.timePicker() || !inputElement.value) return;

		// 1. Get current value or default to today
		const current = untracked(this.dateValue) as any;
		const baseDate = isDate(current) ? new Date(current) : new Date();

		// 2. Parse the "HH:mm" string from the input
		const [hours, minutes] = inputElement.value.split(':').map(Number);

		// 3. Update the local time components on the existing date
		// This preserves the local Year, Month, and Day perfectly
		baseDate.setHours(hours, minutes, 0, 0);

		// 4. Update the model
		this.value.set(baseDate.valueOf());
	}

	protected onClearButtonClicked() {
		this.value.set(null);
	}
}
