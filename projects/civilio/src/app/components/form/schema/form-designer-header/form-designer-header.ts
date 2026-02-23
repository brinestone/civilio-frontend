import { BooleanInput } from "@angular/cdk/coercion";
import { KeyValuePipe } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, isDevMode, output, signal } from "@angular/core";
import { FormItemDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideFormInput, lucideImage, lucideStickyNote } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmButtonGroup, HlmButtonGroupImports } from "@spartan-ng/helm/button-group";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";

const FORM_ITEM_TYPES = {
	field: { icon: 'lucideFormInput', label: 'Question' },
	note: { icon: 'lucideStickyNote', label: 'Note' },
	image: { icon: 'lucideImage', label: 'Image' },
} as Record<FormItemType, { label: string, icon: string }>;

type FormItemType = Strict<FormItemDefinition>['type'];

@Component({
	selector: 'cv-form-designer-header',
	imports: [
		HlmDropdownMenuImports,
		HlmButtonGroupImports,
		HlmButton,
		HlmButtonGroup,
		NgIcon,
		KeyValuePipe
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form-designer-header.html',
	styleUrl: './form-designer-header.scss',
	viewProviders: [
		provideIcons({
			lucideFormInput,
			lucideStickyNote,
			lucideImage
		})
	]
})
export class FormDesignerHeader {
	readonly editable = input<boolean, BooleanInput>(isDevMode(), { transform: booleanAttribute });

	readonly itemAdd = output<FormItemType>();
	readonly toggleEdit = output();

	protected readonly itemTypes = FORM_ITEM_TYPES;
	protected readonly lastAddedItemType = signal<FormItemType>('field');
	protected readonly lastAddedItemLabel = computed(() => FORM_ITEM_TYPES[this.lastAddedItemType()].label);
	protected readonly lastAddedItemIcon = computed(() => FORM_ITEM_TYPES[this.lastAddedItemType()].icon);
}
