import { ChangeDetectionStrategy, Component, input, model, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSettings, lucideX } from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTabsImports } from "@spartan-ng/helm/tabs";

export type ConfigTab = {
	label: string;
	value: string;
	icon?: string;
}

@Component({
	selector: 'cv-form-item-settings',
	templateUrl: './form-item-settings.html',
	styleUrl: './form-item-settings.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		HlmTabsImports,
		NgIcon,
		HlmButton
	],
	viewProviders: [
		provideIcons({
			lucideSettings,
			lucideX
		})
	],
})
export class FormItemSettingsDesigner {
	readonly close = output();
	readonly activeConfigTab = model.required<string>({ alias: 'tab' });
	readonly configTabs = input.required<ConfigTab[]>({ alias: 'tabs' });
}
