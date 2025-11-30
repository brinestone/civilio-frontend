import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
	Component,
	computed,
	effect,
	forwardRef,
	input,
	OnInit,
	output,
	signal,
	untracked
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
	AbstractControl,
	ControlValueAccessor,
	FormControl,
	FormGroup,
	FormRecord,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
	UntypedFormControl
} from '@angular/forms';
import {
	extractFieldKey,
	extractValidators,
	GroupFieldSchema
} from '@app/model/form';
import { DeltaChangeEvent } from '@app/model/form/events';
import { IsStringPipe, JoinArrayPipe } from '@app/pipes';
import { Option } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import {
	ErrorStateMatcher,
	ShowOnDirtyErrorStateMatcher
} from '@spartan-ng/brain/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmFieldError, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { debounce, isEqual } from 'lodash';
import { pairwise, startWith } from 'rxjs';

type RowForm = FormGroup<{
	key: FormControl<string>;
	data: FormRecord<UntypedFormControl>;
}>

const cva = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => GroupFieldComponent),
	multi: true
}

@Component({
	selector: 'cv-group-field',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
		provideIcons({
			lucidePlus,
			lucideTrash2,
			lucidePencil
		})
	],
	imports: [
		ReactiveFormsModule,
		IsStringPipe,
		TranslatePipe,
		HlmCheckbox,
		HlmSelectImports,
		BrnSelectImports,
		DecimalPipe,
		HlmButton,
		NgIcon,
		HlmSheetImports,
		BrnSheetImports,
		NgTemplateOutlet,
		HlmFieldImports,
		HlmLabel,
		HlmInput,
		JoinArrayPipe,
		HlmFieldError
	],
	providers: [
		cva
	],
	host: {
		class: 'group'
	},
	templateUrl: './group-field.component.html',
	styleUrl: './group-field.component.scss',
})
export class GroupFieldComponent implements OnInit, ControlValueAccessor {
	readonly enableMutation = input<boolean>();
	readonly schema = input.required<GroupFieldSchema>();
	readonly optionSource = input<Record<string, Option[]>>();
	readonly editFormHeader = input<string>();
	readonly editFormDescription = input<string>();
	readonly deltaChange = output<DeltaChangeEvent<any>[]>();
	readonly changed = output<Record<string, unknown>>();
	readonly delete = output();

	protected touchedCallback?: () => void;
	protected readonly _disabled = signal(false);
	protected readonly form = new FormRecord<UntypedFormControl>({});
	protected readonly data = signal<Record<string, unknown>>({});
	protected readonly relevanceRegistry = signal<Record<string, boolean>>({});
	protected addCachedDeltaChange = debounce(this.addCachedDeltaChangeHandler, 400)
	private changedCallback?: (value: any) => void;
	private schemaFieldKeys = computed(() => this.schema().fields.flatMap(f => extractFieldKey(f.key)));
	private initialized = false;
	private eventCache = Array<DeltaChangeEvent<any>>();
	private readonly valueChanges = toSignal(this.form.valueChanges.pipe(
		takeUntilDestroyed(),
		startWith(this.form.value),
		pairwise()
	));

	constructor() {
		this.form.valueChanges.pipe(
			takeUntilDestroyed()
		).subscribe(v => {
			for (const field of this.schema().fields) {
				const key = extractFieldKey(field.key);
				if (!field.relevance) {
					this.relevanceRegistry.update(old => ({ ...old, [key]: true }));
					continue;
				}
				const { dependencies, predicate } = field.relevance;
				const deps = dependencies.reduce((acc, curr) => {
					acc[curr] = v[curr];
					return acc;
				}, {} as Record<string, unknown>);
				const isRelevant = predicate(deps as any);
				this.relevanceRegistry.update(old => ({ ...old, [key]: isRelevant }));
			}
		});
		effect(() => {
			if (!this.initialized) return;
			this.setupControls();
		});
		effect(() => {
			if (!this.initialized) return;
			const data = this.data();
			this.form.patchValue(data, { emitEvent: false, onlySelf: true });
			this.resetForm(this.form);
		})
	}

	ngOnInit() {
		this.setupControls();
		this.initialized = true;
	}

	writeValue(data: any): void {
		this.data.set(data);
	}

	registerOnChange(fn: any): void {
		this.changedCallback = fn;
	}

	registerOnTouched(fn: any): void {
		this.touchedCallback = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		this._disabled.set(isDisabled);
	}

	protected onAddButtonClicked() {
	}

	protected onDeleteButtonClicked() {
		this.delete.emit();
	}

	protected findOption(group: string, value: string) {
		return this.optionSource()?.[group].find(o => o.value == value);
	}

	protected onFormSheetClosed() {
		const value = this.form.value;
		const pristineData = untracked(this.data);
		if (isEqual(value, pristineData)) return;
		this.changedCallback?.(value);
		this.changed.emit(value);
		this.data.set(value);

		if (this.eventCache.length == 0) return;
		this.deltaChange.emit([...this.eventCache]);
		this.eventCache = [];
	}

	private setupControls() {
		const schema = this.schema();
		const data = untracked(this.data);
		const schemaFieldKeys = untracked(this.schemaFieldKeys);
		for (const field of schema.fields) {
			const key = extractFieldKey(field.key);
			if (this.form.contains(key)) {
				if (!schemaFieldKeys.includes(key)) this.form.removeControl(key);
				continue;
			}
			const validators = extractValidators(field);
			this.form.addControl(key, new UntypedFormControl(data[key], validators), { emitEvent: false });
		}
	}

	private resetForm(form: AbstractControl) {
		form.markAsUntouched();
		form.markAsPristine();
		form.updateValueAndValidity();
	}

	private addCachedDeltaChangeHandler(key: string, value: any) {
		this.eventCache.push({
			path: [key],
			changeType: 'update',
			newValue: value,
			oldValue: untracked(this.data)[key],
		});
	}
}
