import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSettings, lucideTable2 } from '@ng-icons/lucide';

@Component({
  selector: 'cv-base',
  viewProviders: [
    provideIcons({
      lucideTable2,
      lucideSettings,
    })
  ],
  imports: [NgIcon, RouterLink, RouterLinkActive],
  templateUrl: './base.layout.html',
  styleUrl: './base.layout.scss'
})
export class BaseLayout {
  protected leftLinks = [
    { label: 'Forms', icon: 'lucideTable2', path: '/submissions' },
    { label: 'Settings', icon: 'lucideSettings', path: '/settings' },
  ]
}
