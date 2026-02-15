import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model, numberAttribute } from "@angular/core";
import { FormValueControl } from "@angular/forms/signals";
import { NumberRange } from "@civilio/sdk/models";
import { HlmInput } from "@spartan-ng/helm/input";
import { produce } from "immer";

@Component({
	selector: 'cv-number-range-input',
	viewProviders: [],
	imports: [
		HlmInput
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<input [readonly]="readonly()" [disabled]="disabled()" type="number" [min]="min()" [max]="end()" (change)="startChanged($event)" [value]="start()" [step]="step()" hlmInput [placeholder]="minPlaceholder() ?? 'Min'" class="rounded-r-none border-r-0">
		<input [readonly]="readonly()" [disabled]="disabled()" type="number" [max]="max()" [min]="start()" (change)="endChanged($event)" [value]="end()" [step]="step()" hlmInput [placeholder]="maxPlaceholder() ?? 'Max'" class="rounded-l-none">
	`,
	styles: `
		:host {
			display: inline-flex;
			align-items: stretch;
		}
	`
})
export class NumberRangeInputComponent implements FormValueControl<NumberRange | null | undefined> {
	readonly value = model<NumberRange | null>();
	readonly minPlaceholder = input<string>();
	readonly maxPlaceholder = input<string>();
	readonly step = input<number>();
	readonly min = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
	readonly max = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
	readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
	readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

	protected readonly start = computed(() => this.value()?.start);
	protected readonly end = computed(() => this.value()?.end);

	protected startChanged(event: Event) {
		if (this.disabled()) return;
		const inputElement = event.target as HTMLInputElement;

		const value = Number(inputElement.value || undefined);
		this.value.update(v => produce(v ?? {}, draft => {
			draft.start = isNaN(value) ? undefined : value;
		}));
	}

	protected endChanged(event: Event) {
		if (this.disabled()) return;
		const inputElement = event.target as HTMLInputElement;

		const value = Number(inputElement.value || undefined);
		this.value.update(v => produce(v ?? {}, draft => {
			draft.end = isNaN(value) ? undefined : value;
		}));
	}
}
