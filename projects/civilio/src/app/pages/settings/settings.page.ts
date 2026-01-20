import { CdkListboxModule } from '@angular/cdk/listbox';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideCheck,
	lucideFormInput,
	lucideInfo,
	lucideListCheck,
	lucideSave,
	lucideSettings,
	lucideSlidersVertical,
	lucideTrash2,
	lucideUnlink2,
	lucideWrench
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HlmInput } from '@spartan-ng/helm/input';

const sections = [
	{
		label: 'settings.general.title',
		icon: 'lucideSlidersVertical',
		path: 'general'
	},
	{
		label: 'settings.field_mapper',
		icon: 'lucideUnlink2',
		path: 'field-mapping'
	},
	{
		label: 'settings.dataset.page_title',
		icon: 'lucideListCheck',
		path: 'choice-editor'
	},
	{
		label: 'settings.forms.page_title',
		icon: 'lucideFormInput',
		path: 'forms'
	},
	{ label: 'settings.advanced.title', icon: 'lucideWrench', path: 'advanced' },
	{ label: 'settings.about.title', icon: 'lucideInfo', path: 'about' },
] as const

@Component({
	selector: 'cv-settings',
	viewProviders: [
		provideIcons({
			lucideSettings,
			lucideSave,
			lucideFormInput,
			lucideInfo,
			lucideTrash2,
			lucideSlidersVertical,
			lucideWrench,
			lucideListCheck,
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
	private readonly ts = inject(TranslateService);
	protected readonly sections = signal(sections);
	protected readonly sectionFilter = signal('');
	protected readonly filteredSections = computed(() => {
		const filter = this.sectionFilter();
		const sections = this.sections();
		if (!filter) return sections;
		return sections.filter(v => this.ts.instant(v.label).toLowerCase().includes(filter.trim().toLowerCase()));
	});
}
