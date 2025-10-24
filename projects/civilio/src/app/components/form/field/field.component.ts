import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, forwardRef, inject, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldSchema } from '@app/model/form';
import { Option } from '@civilio/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDatePicker } from '@spartan-ng/helm/date-picker';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
	selector: 'cv-field',
	imports: [
		HlmLabel,
		BrnSelectImports,
		HlmSelectImports,
		HlmInput,
		NgTemplateOutlet,
		TranslatePipe,
		HlmCheckbox,
		HlmDatePicker
	],
	templateUrl: './field.component.html',
	styleUrl: './field.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{ multi: true, provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldComponent) }
	]
})
export class FieldComponent implements ControlValueAccessor {
	readonly schema = input.required<FieldSchema>();
	readonly options = input<Record<string, Option[]>>();
	readonly parentValue = input<any>();

	private cdr = inject(ChangeDetectorRef);

	protected changeCallback?: (v: any) => void;
	protected touchedCallback?: () => void;
	protected readonly _disabled = signal(false);
	protected readonly _value = model<any>();

	constructor() {
		effect(() => {
			const _ = this._value();
			this.cdr.markForCheck();
		})
	}

	writeValue(obj: any): void {
		this._value.set(obj);
	}
	registerOnChange(fn: any): void {
		this.changeCallback = fn;
	}
	registerOnTouched(fn: any): void {
		this.touchedCallback = fn;
	}
	setDisabledState(isDisabled: boolean): void {
		this._disabled.set(isDisabled);
	}

	protected onInput(update: any) {
		this.onControlTouched();
		this._value.set(update);
		this.changeCallback?.(update);
	}

	protected onControlTouched() {
		this.touchedCallback?.();
	}

}
