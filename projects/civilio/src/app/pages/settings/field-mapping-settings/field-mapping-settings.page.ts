import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'cv-field-mapping-settings',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
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
