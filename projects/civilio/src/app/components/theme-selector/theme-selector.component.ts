import { Component, input, linkedSignal } from "@angular/core";
import { provideIcons, NgIcon } from "@ng-icons/core";
import { lucideSun, lucideComputer, lucideMoon } from "@ng-icons/lucide";
import { dispatch, select } from "@ngxs/store";
import { BrnToggleGroupModule } from "@spartan-ng/brain/toggle-group";
import { HlmToggleGroupModule } from "@spartan-ng/helm/toggle-group";
import { SetTheme } from "../../state/config";
import { currentTheme } from "../../state/selectors";

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
    HlmToggleGroupModule, NgIcon, BrnToggleGroupModule
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
