import { Component, computed } from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { StandardFacilityTagsSchema } from "@app/components/form/schema/form-designer-config";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideX } from "@ng-icons/lucide";
import {} from "@spartan-ng/brain/select";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmLabel } from "@spartan-ng/helm/label";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { produce } from "immer";
import z from "zod";
import { injectFormItemDesignerContext } from "../items";
import { Tag } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { HlmIcon } from "@spartan-ng/helm/icon";
import { FieldError } from "../../field-error/field-error.component";

@Component({
	selector: "cv-form-item-meta-config",
	viewProviders: [
		provideIcons({
			lucidePlus,
			lucideX,
		}),
	],
	imports: [
		HlmFieldImports,
		HlmSelectImports,
		FormField,
		FieldError,
		HlmButton,
		HlmInput,
		HlmIcon,
		NgIcon,
		HlmLabel,
	],
	hostDirectives: [],
	templateUrl: "./form-item-meta-config.html",
	styleUrl: "./form-item-meta-config.scss",
})
export class FormItemMetaConfig {
	private ctx = injectFormItemDesignerContext();
	protected readonly item = this.ctx.fieldTree;
	protected readonly index = this.ctx.index;
	protected readonly tags = computed(() => {
		return this.item().tags;
	});
	protected readonly metaTag = computed(() => {
		return this.item().metaTag;
	});
	protected readonly standardTags = StandardFacilityTagsSchema.options;
	protected readonly tagsMap: Record<
		z.infer<typeof StandardFacilityTagsSchema>,
		{ label: string }
	> = {
		"tags::facility::coords": { label: "GPS Location" },
		"tags::facility::createdAt": { label: "Date created" },
		"tags::facility::location": { label: "Location" },
		"tags::facility::name": { label: "Facility name" },
	};

	protected onAddTagButtonPressed() {
		this.tags()().value.update((tags) =>
			produce(tags, (draft) => {
				draft.unshift(Tag.parse({}) as unknown as Strict<Tag>);
			}),
		);
	}

	protected onRemoveTagButtonClicked(index: number) {
		this.tags()().value.update((tags) =>
			produce(tags, (draft) => {
				draft.splice(index, 1);
			}),
		);
	}
}
