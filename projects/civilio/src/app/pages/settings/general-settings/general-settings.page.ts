import { Component } from '@angular/core';
import { LocaleSelectorComponent, ThemeSelectorComponent } from '@app/components';
import { provideIcons } from '@ng-icons/core';


@Component({
  selector: 'cv-general-settings',
  viewProviders: [
    provideIcons({

    }),
  ],
  providers: [
  ],
  imports: [
    ThemeSelectorComponent,
    LocaleSelectorComponent
],
  host: {
    'class': 'page'
  },
  templateUrl: './general-settings.page.html',
  styleUrl: './general-settings.page.scss'
})
export class GeneralSettingsPage {

}
