import { ModelSignal, InputSignal, InputSignalWithTransform, OutputRef, input } from "@angular/core";
import { DisabledReason, FormValueControl, ValidationError, WithOptionalField } from "@angular/forms/signals";

export abstract class BaseFormValueControl<T> implements FormValueControl<T> {
	abstract value: ModelSignal<T>;
	checked?: undefined;
	errors?: InputSignal<readonly WithOptionalField<ValidationError>[]> | InputSignalWithTransform<readonly WithOptionalField<ValidationError>[], unknown>;
	disabled?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	disabledReasons?: InputSignal<readonly WithOptionalField<DisabledReason>[]> | InputSignalWithTransform<readonly WithOptionalField<DisabledReason>[], unknown> | undefined;
	readonly?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	hidden?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	invalid?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	pending?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	touched?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | ModelSignal<boolean> | OutputRef<boolean> | undefined;
	dirty?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	name?: InputSignal<string> | InputSignalWithTransform<string, unknown> | undefined;
	required?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown> | undefined;
	min?: InputSignal<number | undefined> | InputSignalWithTransform<number | undefined, unknown> | undefined;
	minLength?: InputSignal<number | undefined> | InputSignalWithTransform<number | undefined, unknown> | undefined;
	max?: InputSignal<number | undefined> | InputSignalWithTransform<number | undefined, unknown> | undefined;
	maxLength?: InputSignal<number | undefined> | InputSignalWithTransform<number | undefined, unknown> | undefined;
	pattern?: InputSignal<readonly RegExp[]> | InputSignalWithTransform<readonly RegExp[], unknown> | undefined;

}
