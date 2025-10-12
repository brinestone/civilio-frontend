import { Component, resource } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { sendRpcMessageAsync } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideTable2 } from '@ng-icons/lucide';
import {
  BrnToggleGroupModule
} from '@spartan-ng/brain/toggle-group';
import { ThemeSelectorComponent } from '../../components/theme-selector/theme-selector.component';

@Component({
  selector: 'cv-base',
  viewProviders: [
    provideIcons({
      lucideTable2,
      lucideSettings,
    })
  ],
  imports: [NgIcon, RouterLink, RouterLinkActive, ThemeSelectorComponent,
    BrnToggleGroupModule,],
  templateUrl: './base.layout.html',
  styleUrl: './base.layout.scss'
})
export class BaseLayout {
  protected leftLinks = [
    { label: 'Form Submissions', icon: 'lucideTable2', path: '/submissions' },
    { label: 'Settings', icon: 'lucideSettings', path: '/settings' },
  ];
  protected readonly wideLogoUrl = resource({
    loader: async () => {
      return await sendRpcMessageAsync('resource:read', 'img/LogoWide.png');
    }
  });
}
