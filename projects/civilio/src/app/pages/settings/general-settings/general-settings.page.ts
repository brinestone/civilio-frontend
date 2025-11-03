import { Component } from '@angular/core';
import { LocaleSelectorComponent, ThemeSelectorComponent } from '@app/components';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
	selector: 'cv-general-settings',
	imports: [
		ThemeSelectorComponent,
		LocaleSelectorComponent,
		TranslatePipe
	],
	host: {
		'class': 'page'
	},
	templateUrl: './general-settings.page.html',
	styleUrl: './general-settings.page.scss'
})
export class GeneralSettingsPage {

}
