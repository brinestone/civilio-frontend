import { CdkListboxModule } from '@angular/cdk/listbox';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideCheck,
	lucideInfo,
	lucideSave,
	lucideSettings,
	lucideSlidersVertical,
	lucideTrash2,
	lucideUnlink2,
	lucideUsers,
	lucideWrench
} from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmInput } from '@spartan-ng/helm/input';

const sections = [
	{ label: 'settings.general', icon: 'lucideSlidersVertical', path: 'general' },
	{
		label: 'settings.field_mapper',
		icon: 'lucideUnlink2',
		path: 'field-mapping'
	},
	{ label: 'settings.advanced.title', icon: 'lucideWrench', path: 'advanced' },
	{ label: 'settings.users.title', icon: 'lucideUsers', path: 'users', accessibleRole: 'admin' },
	{ label: 'settings.about.title', icon: 'lucideInfo', path: 'about' },
] as const

@Component({
	selector: 'cv-settings',
	viewProviders: [
		provideIcons({
			lucideSettings,
			lucideUsers,
			lucideSave,
			lucideInfo,
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
		TranslatePipe,
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
