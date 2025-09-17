import { CdkListboxModule } from '@angular/cdk/listbox';
import { Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideSave, lucideSettings, lucideSlidersVertical, lucideTrash2, lucideUnlink2, lucideWrench } from '@ng-icons/lucide';
import { HlmInput } from '@spartan-ng/helm/input';

const sections = [
  { label: 'General', icon: 'lucideSlidersVertical', path: 'general' },
  { label: 'Field Mapping', icon: 'lucideUnlink2', path: 'field-mapping' },
  { label: 'Advanced', icon: 'lucideWrench', path: 'advanced' },
] as const

@Component({
  selector: 'cv-settings',
  viewProviders: [
    provideIcons({
      lucideSettings,
      lucideSave,
      lucideTrash2,
      lucideSlidersVertical,
      lucideWrench,
      lucideUnlink2,
      lucideCheck
    })
  ],
  imports: [
    NgIcon,
    HlmInput,
    CdkListboxModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    FormsModule
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPage {
  protected readonly sections = signal(sections);
  protected readonly sectionFilter = signal('');
  protected readonly filteredSections = computed(() => {
    const filter = this.sectionFilter();
    const sections = this.sections();
    if (!filter) return sections;
    return sections.filter(v => v.label.toLowerCase().includes(filter.trim().toLowerCase()));
  });
}
