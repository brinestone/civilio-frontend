import { BooleanInput } from "@angular/cdk/coercion";
import { KeyValuePipe } from "@angular/common";
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, model, output, signal } from "@angular/core";
import { FieldState } from "@angular/forms/signals";
import { FormItemDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideEye, lucideFormInput, lucideImage, lucideRuler, lucideSave, lucideStickyNote, lucideTrash2 } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmButtonGroup, HlmButtonGroupImports } from "@spartan-ng/helm/button-group";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmSpinner } from "@spartan-ng/helm/spinner";

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
		KeyValuePipe,
		HlmSpinner
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form-designer-header.html',
	styleUrl: './form-designer-header.scss',
	viewProviders: [
		provideIcons({
			lucideFormInput,
			lucideStickyNote,
			lucideRuler,
			lucideImage,
			lucideChevronDown,
			lucideEye,
			lucideSave,
			lucideTrash2
		})
	]
})
export class FormDesignerHeader {
	readonly editable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	readonly previewing = model<boolean>(true);
	readonly formState = input.required<FieldState<unknown>>();

	readonly itemAdd = output<FormItemType>();
	readonly onSubmit = output();
	readonly onDiscard = output();

	protected readonly itemTypes = FORM_ITEM_TYPES;
	protected readonly lastAddedItemType = signal<FormItemType>('field');
	protected readonly lastAddedItemLabel = computed(() => FORM_ITEM_TYPES[this.lastAddedItemType()].label);
	protected readonly lastAddedItemIcon = computed(() => FORM_ITEM_TYPES[this.lastAddedItemType()].icon);

	protected onTogglePreviewButtonClicked() {
		this.previewing.update((previewing) => !previewing);
	}
}
