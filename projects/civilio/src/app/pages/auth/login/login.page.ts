import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Field, createMetadataKey, debounce, form, metadata, required } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideLoader } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardImports } from '@spartan-ng/helm/card';
import { HlmField, HlmFieldError, HlmFieldLabel, HlmFieldSet } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';

interface LoginData {
	email: string;
	password: string;
}

@Component({
	selector: 'cv-login',
	viewProviders: [
		provideIcons({
			lucideAlertTriangle,
			lucideLoader
		}),
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmCardImports,
		HlmInput,
		HlmFieldLabel,
		NgIcon,
		Field,
		HlmFieldSet,
		HlmFieldError,
		HlmField,
		HlmButton,
		TranslatePipe,
		HlmAlertImports,
		HlmLabel
	],
	templateUrl: './login.page.html',
	styleUrl: './login.page.scss',
	hostDirectives: [HlmCard],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
	private loginModel = signal<LoginData>({
		email: '',
		password: ''
	});
	protected readonly submitCount = signal(0);
	protected readonly emailLabelMetadataKey = createMetadataKey<string>();
	protected readonly passwordLabelMetadataKey = createMetadataKey<string>();
	protected loginForm = form(this.loginModel, path => {
		metadata(path.email, this.emailLabelMetadataKey, () => 'login.username');
		metadata(path.password, this.emailLabelMetadataKey, () => 'login.password');
		debounce(path.email, 200);
		debounce(path.password, 200);
		required(path.email, { message: 'forms.validation.msg.field_required' });
		required(path.password, { message: 'forms.validation.msg.field_required' });
		// email(path.email, { message: 'forms.msg.invalid_value' });
	});
	protected onFormSubmit(event?: SubmitEvent) {
		event?.preventDefault();
		if (this.loginForm().invalid()) {
			this.submitCount.update(n => n + 1);
			return;
		}
		const data = this.loginModel();
		console.log(data);
	}
}
