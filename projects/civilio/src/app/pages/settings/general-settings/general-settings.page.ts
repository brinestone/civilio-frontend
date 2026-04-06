import { Component, inject } from '@angular/core';
import { LocaleSelectorComponent, ThemeSelectorComponent } from '@app/components';
import { SetFontSize } from '@app/store/config';
import { fontSize } from '@app/store/selectors';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { dispatch, select } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { range } from 'lodash';
import { toast } from 'ngx-sonner';

@Component({
	selector: 'cv-general-settings',
	imports: [
		ThemeSelectorComponent,
		LocaleSelectorComponent,
		TranslatePipe,
		HlmSelectImports,
		BrnSelectImports
	],
	host: {
		'class': 'page'
	},
	templateUrl: './general-settings.page.html',
	styleUrl: './general-settings.page.scss'
})
export class GeneralSettingsPage {
	private readonly setFontSize = dispatch(SetFontSize);
	private readonly ts = inject(TranslateService);

	protected readonly fontSize = select(fontSize);
	protected readonly fontSizes = range(10, 21);
	protected onFontSizeChanged(size: number) {
		this.setFontSize(size).subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant('msg.error.title'), { description: e.message });
			},
		})
	}
}
