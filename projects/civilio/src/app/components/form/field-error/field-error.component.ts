import { BooleanInput } from "@angular/cdk/coercion";
import { booleanAttribute, Component, input } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { HlmFieldError } from "@spartan-ng/helm/field";
import { HlmSpinner } from "@spartan-ng/helm/spinner";

@Component({
	selector: 'cv-field-error',
	template: `
	@if(field()().pending()) {
		<div class="inline-flex gap-2 items-center text-sm">
			<hlm-spinner/>
			<span>Validating...</span>
	</div>
	} @else if (field()().invalid() && (eager() || field()().touched())) {
		<div class="space-y-1">
@for(error of field()().errors(); track error) {
	<hlm-field-error class="block">{{ error.message }}</hlm-field-error>
}
	</div>
	}
	`,
	imports: [
		HlmFieldError,
		HlmSpinner
	]
})
export class FieldError<T> {
	readonly field = input.required<FieldTree<T>>();
	readonly eager = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
}
