import { NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	Signal,
	TemplateRef,
	untracked,
	viewChild,
} from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { FieldError } from "@app/components/form/field-error/field-error.component";
import { NewFormItemField } from "@civilio/sdk/models";
import { HlmFieldGroup, HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmTextarea } from "@spartan-ng/helm/textarea";
import { BaseItemRenderer } from "../base-item-renderer";

@Component({
	selector: "cv-field-renderer",
	templateUrl: "./field-renderer.html",
	styleUrl: "./field-renderer.scss",
	imports: [
		HlmFieldImports,
		FieldError,
		HlmInput,
		FormField,
		NgTemplateOutlet,
		HlmTextarea,
	],
	hostDirectives: [HlmFieldGroup],
})
export class FieldRenderer extends BaseItemRenderer<
	NewFormItemField | NewFormItemField,
	string
> {
	protected readonly config = computed(() => this.itemDefinition().config);
	protected readonly title = computed(() => this.config()?.title);
	protected readonly dataKey = computed(() => this.config()?.dataKey);
	protected readonly description = computed(() => this.config()?.description);
	protected readonly fieldType = computed(() => this.config()?.type);
	protected readonly template = computed(() => {
		const t = this.itemTemplates[this.config()?.type];
		return t ? untracked(t) : undefined;
	});

	private readonly textItemTemplate =
		viewChild.required<TemplateRef<unknown>>("textItemTemplate");

	private readonly itemTemplates = {
		text: this.textItemTemplate,
	} as Record<string, Signal<TemplateRef<unknown>>>;
}
