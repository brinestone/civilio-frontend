import { BooleanInput } from '@angular/cdk/coercion';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	forwardRef,
	inject,
	input,
	output,
	signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
	GeoPointComponent
} from '@app/components/geo-point/geo-point.component';
import {
	defaultValueForType,
	extractFieldKey,
	FieldSchema
} from '@app/model/form';
import { DeltaChangeEvent } from '@app/model/form/events/delta-change-event';
import { IsStringPipe } from '@app/pipes';
import { Option } from '@civilio/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDatePicker } from '@spartan-ng/helm/date-picker';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { ClassValue } from 'clsx';
import { debounce } from 'lodash';

@Component({
	selector: 'cv-field',
	imports: [
		HlmLabel,
		BrnSelectImports,
		HlmSelectImports,
		HlmInput,
		NgTemplateOutlet,
		TranslatePipe,
		GeoPointComponent,
		DatePipe,
		HlmCheckbox,
		HlmDatePicker,
		IsStringPipe
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
	readonly userClass = input<ClassValue>('', { alias: 'class' });
	readonly isReadonly = input<boolean, BooleanInput>(false, { alias: 'readonly', transform: booleanAttribute });
	readonly locale = input<any>();
	readonly changed = output<any>();
	readonly deltaChange = output<DeltaChangeEvent<any>>();

	private cdr = inject(ChangeDetectorRef);

	protected readonly defaultValue = computed(() => defaultValueForType(this.schema().type))
	protected changeCallback?: (v: any) => void;
	protected touchedCallback?: () => void;
	protected readonly _disabled = signal(false);
	protected readonly _value = signal<any>(undefined);
	protected readonly now = new Date();

	constructor() {
		effect(() => {
			this._value();
			this.cdr.markForCheck();
		});
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

	protected onInput = debounce(this.onInputHandler.bind(this), 300);

	private onInputHandler(update: any) {
		this.onControlTouched();
		const previousValue = this._value();
		this._value.set(update);
		this.changeCallback?.(update);
		this.changed.emit(update);
		this.deltaChange.emit({
			newValue: update,
			oldValue: previousValue,
			path: [extractFieldKey(this.schema().key)],
			changeType: 'update'
		});
	}

	protected onControlTouched() {
		this.touchedCallback?.();
	}

}
