import { SlicePipe } from '@angular/common';
import { Component, input, linkedSignal } from '@angular/core';
import { SetLocale } from '@app/store/config';
import { currentLocale } from '@app/store/selectors';
import { NgIcon } from "@ng-icons/core";
import { TranslatePipe } from '@ngx-translate/core';
import { dispatch, select } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
	selector: 'cv-locale-selector',
	imports: [
		BrnSelectImports,
		HlmSelectImports,
		TranslatePipe,
		SlicePipe,
		NgIcon
	],
	templateUrl: './locale-selector.component.html',
	styleUrl: './locale-selector.component.scss'
})
export class LocaleSelectorComponent {
	public readonly size = input<'sm' | 'default'>();

	protected readonly _size = linkedSignal(() => this.size() ?? 'default');
	protected readonly setLocale = dispatch(SetLocale);
	protected readonly appliedLocale = select(currentLocale);
	protected readonly selectedLocale = linkedSignal(() => this.appliedLocale());
}
