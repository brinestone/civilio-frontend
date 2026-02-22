import { BooleanInput } from "@angular/cdk/coercion";
import { CdkDrag, CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { booleanAttribute, ChangeDetectionStrategy, Component, InjectionToken, input, InputSignal, isDevMode, model, output } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { FormItemDefinition } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { injectFormItemContext } from "..";

@Component({
	selector: 'base-form-item',
	template: `
		<div *cdkDragPlaceholder class="drag-placeholder"></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CdkDragPlaceholder],
	hostDirectives: [
		{
			directive: CdkDrag,
			inputs: ['cdkDragLockAxis']
		}
	],
	host: {
		'[class.group/form-item]': 'true',
		'[class.relative]': 'true',
	},
	styleUrl: './base-form-item-schema-designer.scss'
})
export abstract class BaseFormItemSchemaDesigner<T extends FormItemDefinition> {
	abstract node: InputSignal<FieldTree<Strict<T>>>;
	readonly index = input.required<number>();
	readonly expanded = model<boolean>(isDevMode())
	readonly editing = model<boolean>(true);
	readonly showDebug = input<boolean, BooleanInput>(isDevMode(), { transform: booleanAttribute });

	// readonly deleted = output();
	// readonly duplicate = output();

	protected readonly context = injectFormItemContext();
}
