import { BooleanInput } from "@angular/cdk/coercion";
import { CdkDrag, CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { booleanAttribute, ChangeDetectionStrategy, Component, input, InputSignal, isDevMode, output } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { FormItemDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";

@Component({
	selector: 'base-form-item',
	template: `
		<div *cdkDragplaceholder class="drag-placeholder"></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CdkDragPlaceholder],
	hostDirectives: [
		{
			directive: CdkDrag,
			inputs: ['cdkDragLockAxis']
		}
	]
})
export abstract class BaseFormItemSchemaDesigner<T extends FormItemDefinition> {
	// readonly node = input.required<FieldTree<Strict<T>>>();
	abstract node: InputSignal<FieldTree<Strict<T>>>;
	readonly index = input.required<number>();
	readonly editable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	readonly expanded = input<boolean, BooleanInput>(isDevMode(), { transform: booleanAttribute });
	readonly previewing = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	readonly activeConfigTab = input<string>();
	readonly enableDebug = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

	readonly settingsToggle = output<boolean>();
	readonly previewToggle = output<boolean>();
	readonly tabChange = output<string>();
	readonly copy = output();
}