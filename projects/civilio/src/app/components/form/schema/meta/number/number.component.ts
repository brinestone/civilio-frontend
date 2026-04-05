import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	untracked,
} from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { FieldError } from "@app/components/form/field-error/field-error.component";
import { NumberFieldConfig } from "@civilio/sdk/models";
import {
	HlmFieldGroup,
	HlmFieldImports,
	HlmFieldLabel,
} from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { BaseFieldConfig } from "../base-meta-config/base-meta-config.component";

@Component({
	selector: "cv-number-meta",
	imports: [HlmFieldImports, HlmInput, HlmFieldLabel, FormField, FieldError],
	templateUrl: "./number.component.html",
	styleUrl: "./number.component.scss",
	hostDirectives: [HlmFieldGroup],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberComponent extends BaseFieldConfig<NumberFieldConfig> {
	protected readonly step = computed(() => {
		return untracked(this.meta).type().value() == "float" ? 0.1 : 1;
	});
	constructor() {
		super();
		effect(() => {
			const meta = untracked(this.meta);
			const readonly = meta.readonly().value();
			if (readonly) {
				meta.min().value.set(null as any);
				meta.max().value.set(null as any);
				meta.required().value.set(false);
			}
		});
	}
}
