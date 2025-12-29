import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'cv-field-mapping-settings',
  imports: [
    RouterOutlet,
    RouterLink,
		TranslatePipe,
    RouterLinkActive
  ],
	host: {
		class: 'scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent'
	},
  templateUrl: './field-mapping-settings.page.html',
  styleUrl: './field-mapping-settings.page.scss'
})
export class FieldMappingSettingsPage {
  protected readonly links = [
    { path: 'fosa', label: 'Fosa' },
    { path: 'chefferie', label: 'Chiefdom' },
    { path: 'csc', label: 'CSC' },
  ];
}
