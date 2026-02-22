import { ChangeDetectionStrategy, Component, effect, untracked } from '@angular/core';
import { HlmField, HlmFieldError, HlmFieldGroup, HlmFieldImports, HlmFieldLabel } from '@spartan-ng/helm/field';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';
import { TextFieldMeta } from '@civilio/sdk/models';
import { FormField } from '@angular/forms/signals';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { NgTemplateOutlet } from '@angular/common';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAtSign, lucideGlobe, lucidePhone } from '@ng-icons/lucide';
import { current, produce } from 'immer';
import { HlmTextarea } from '@spartan-ng/helm/textarea';

@Component({
	selector: 'cv-text-meta',
	viewProviders: [
		provideIcons({
			lucideAtSign,
			lucideGlobe,
			lucidePhone
		})
	],
	imports: [
		HlmFieldImports,
		HlmToggleGroupImports,
		NgIcon,
		FormField,
		HlmTextarea,
		HlmSpinner,
		HlmInput,
		NgTemplateOutlet
	],
	hostDirectives: [
		HlmFieldGroup
	],
	templateUrl: './text-meta.component.html',
	styleUrl: './text-meta.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextMetaComponent extends BaseMetaConfigComponent<TextFieldMeta> {
	protected readonly patternPresets = [
		{ name: 'email', label: 'Email', icon: 'lucideAtSign', regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$` },
		{ name: 'phone', label: 'Phone', icon: 'lucidePhone', regex: `^(\\+?237|\\(\\+?237\\))?6([5679]|[2])\\d{7}$` },
		{ name: 'url', label: 'URL', icon: 'lucideGlobe', regex: `^((https?|ftp):\\/\\/)?((\\d{1,3}\\.){3}\\d{1,3}|(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6})\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$` }
	]
	protected onTextFieldPatternInputValueChanged() {
		this.meta()().value.update(v => produce(v, draft => {
			const pattern = current(draft).pattern;
			if (!pattern) {
				draft.pattern = null as any;
				return;
			}
		}));
	}
	protected onTextFieldPatternPresetChanged(preset?: string) {
		this.meta()().value.update(v => produce(v, draft => {
			draft.pattern = preset ?? null as any;
		}));
	}
	constructor() {
		super();
		effect(() => {
			const readonly = untracked(this.meta).readonly().value();
			if (readonly) {
				untracked(this.meta)().value.update(v => produce(v, draft => {
					draft.required = false;
					draft.maxlength = null as any;
					draft.minlength = null as any;
					draft.pattern = null as any;
				}))
			}
		})
	}
}
