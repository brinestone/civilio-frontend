import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { BooleanFieldConfig } from "@civilio/sdk/models";

import { HlmButtonGroupImports } from "@spartan-ng/helm/button-group";
import { HlmCheckbox } from "@spartan-ng/helm/checkbox";
import {
	HlmField,
	HlmFieldError,
	HlmFieldGroup,
	HlmFieldLabel,
} from "@spartan-ng/helm/field";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { BaseFieldConfig } from "../base-meta-config/base-meta-config.component";

@Component({
	selector: "cv-boolean-meta",
	imports: [
		HlmSelectImports,

		HlmButtonGroupImports,
		FormField,
		HlmCheckbox,
		HlmFieldLabel,
		HlmField,
		NgTemplateOutlet,
		HlmFieldError,
		HlmSpinner,
	],
	hostDirectives: [HlmFieldGroup],
	templateUrl: "./boolean-meta.component.html",
	styleUrl: "./boolean-meta.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanMetaComponent extends BaseFieldConfig<BooleanFieldConfig> {
	protected onClearDefaultValueButtonClicked() {
		this.meta()
			.defaultValue()
			.value.set(null as any);
	}
}
