import { Component, input, linkedSignal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideComputer, lucideMoon, lucideSun } from "@ng-icons/lucide";
import { dispatch, select } from "@ngxs/store";
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { SetTheme } from "../../store/config";
import { currentTheme } from "../../store/selectors";


@Component({
	selector: 'cv-theme-selector',
	viewProviders: [
		provideIcons({
			lucideSun,
			lucideComputer,
			lucideMoon
		})
	],
	imports: [
		HlmToggleGroupImports, NgIcon
	],
	templateUrl: './theme-selector.component.html',
	styleUrl: './theme-selector.component.scss'
})
export class ThemeSelectorComponent {
	public readonly size = input<"default" | "sm" | "lg" | null>();
	protected setTheme = dispatch(SetTheme);
	private appliedTheme = select(currentTheme);
	protected theme = linkedSignal(() => this.appliedTheme());

	protected themeOptions = [
		{ label: 'Dark', value: 'dark', icon: 'lucideMoon' },
		{ label: 'Light', value: 'light', icon: 'lucideSun' },
		{ label: 'System', value: 'system', icon: 'lucideComputer' },
	];
}
