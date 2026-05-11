import { Component, computed, effect, untracked } from "@angular/core";
import { injectFormItemDesignerContext } from "../../items";
import { FormItemGroup, NewFormItemGroup } from "@civilio/sdk/models";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmSwitch } from "@spartan-ng/helm/switch";
import { FormField } from "@angular/forms/signals";
import { formItemPathSeparator, HINT } from "@app/components/form/schema/form-designer-config";
import { FieldError } from "@app/components/form";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from "@spartan-ng/brain/select";
import z from "zod";

const slugifier = z.string().trim().slugify().nullish().default("").transform(v => v?.replace(/[-]/g, '_') ?? null);
@Component({
	selector: "cv-group-config-designer",
	templateUrl: "./group-config-designer.html",
	styleUrl: "./group-config-designer.scss",
	imports: [HlmFieldImports, HlmSelectImports, BrnSelectImports, HlmSwitch, FormField, FieldError, HlmInput],
})
export class GroupConfigDesigner {
	protected readonly ctx = injectFormItemDesignerContext<
		FormItemGroup | NewFormItemGroup
	>();
	protected readonly index = this.ctx.index;
	protected readonly item = this.ctx.fieldTree;
	protected readonly config = computed(() => this.item().config);

	protected readonly repeatableHint = computed(() =>
		this.config().repeatable().metadata(HINT)?.(),
	);
	constructor() {
		effect(() => {
			const meta = untracked(this.item).config;
			if (!meta.autoDataKey().value()) return;
			const path = untracked(this.item).path;
			const title = meta.title().value();
			const slug = title ? slugifier.parse((path().value().length == 1 ? path().value() : path().value().split(formItemPathSeparator).filter((_, i) => i == 0 || i > 2).join(formItemPathSeparator)) + " " + title)! : "";
			meta.dataKey().value.set(slug.slice(0, 63) || (null as any));
		});
	}

}
