import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideEye, lucideSettings, lucideTrash2 } from '@ng-icons/lucide';
import { ButtonVariants, HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmToggle } from '@spartan-ng/helm/toggle';

export type FormItemAction = {
	label: string,
	icon: string;
	variant?: ButtonVariants['variant'];
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
			lucideCopy
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
		NgIcon,
		HlmToggle,
	],
	templateUrl: './form-item-actions.component.html',
	styleUrl: './form-item-actions.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormItemActionsComponent {
	toggleSettings = output<boolean>();
	togglePreview = output<boolean>();
	duplicate = output();
	delete = output();

	protected readonly actions = signal<FormItemAction[]>([
		{ toggle: (state: 'on' | 'off') => this.toggleSettings.emit(state == 'on'), icon: 'lucideSettings', label: 'Toggle Settings', type: 'toggle' },
		{ toggle: (state: 'on' | 'off') => this.togglePreview.emit(state == 'on'), icon: 'lucideEye', label: 'Preview', type: 'toggle' },
		{ handler: () => this.duplicate.emit(), icon: 'lucideCopy', label: 'Duplicate Item', type: 'button' },
		{ handler: () => this.delete.emit(), icon: 'lucideTrash2', label: 'Delete Item', type: 'button', variant: 'destructive' }
	]);
}
