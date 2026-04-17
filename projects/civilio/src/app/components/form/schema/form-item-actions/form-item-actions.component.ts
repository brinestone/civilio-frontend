import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, ChangeDetectionStrategy, Component, effect, input, output, Signal, signal, untracked } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideEye, lucideListMinus, lucideListPlus, lucideSettings, lucideTrash2 } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonVariants, HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmToggle } from '@spartan-ng/helm/toggle';
import { produce } from 'immer';

export type FormItemAction = {
	label: string,
	icon: string;
	variant?: ButtonVariants['variant'];
	condition?: boolean;
} & ({
	type: 'button',
	handler?: (event: MouseEvent) => void;
} | {
	type: 'toggle',
	toggle?: (value: 'on' | 'off') => void;
})

@Component({
	selector: 'cv-form-item-actions',
	viewProviders: [
		provideIcons({
			lucideEye,
			lucideSettings,
			lucideTrash2,
			lucideCopy,
			lucideListMinus,
			lucideListPlus
		})
	],
	hostDirectives: [
		{
			directive: HlmButtonGroup,
			inputs: ['orientation: orientation']
		}
	],
	imports: [
		HlmButton,
		TranslatePipe,
		NgIcon,
		HlmToggle,
	],
	templateUrl: './form-item-actions.component.html',
	styleUrl: './form-item-actions.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormItemActions {
	showLibAdd = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
	isInLibrary = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	updatingLib = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

	toggleSettings = output<boolean>();
	// togglePreview = output<boolean>();
	libToggle = output<boolean>();
	delete = output();

	protected readonly actions = signal<FormItemAction[]>([
		{ toggle: (state: 'on' | 'off') => this.toggleSettings.emit(state == 'on'), icon: 'lucideSettings', label: 'form.designer.items.actions.settings.label', type: 'toggle' },
		// { condition: true, toggle: (state) => this.libToggle.emit(state == 'on'), icon: 'lucideListPlus', label: 'form.designer.items.actions.addLib.label', type: 'toggle' },
		{ handler: () => this.delete.emit(), icon: 'lucideTrash2', label: 'form.designer.items.actions.delete.label', type: 'button', variant: 'destructive' }
	]);

	// constructor() {
	// 	effect(() => {
	// 		const shouldShowLibBtn = this.showLibAdd();
	// 		const inLib = this.isInLibrary();
	// 		this.actions.update(v => produce(v, draft => {
	// 			draft[1].condition = shouldShowLibBtn;
	// 			if (inLib) {
	// 				draft[1].icon = 'lucideListMinus';
	// 				draft[1].variant = 'default'
	// 			} else {
	// 				draft[1].icon = 'lucideListPlus';
	// 				draft[1].variant = 'outline'
	// 			}
	// 		}));
	// 		console.log(untracked(this.actions));
	// 	});
	// }
}
