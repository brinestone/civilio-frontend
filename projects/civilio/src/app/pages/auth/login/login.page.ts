import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginUser } from '@app/store/auth';
import { credentialssaved } from '@app/store/selectors';
import { isActionLoading } from '@app/util';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmField, HlmFieldError, HlmFieldGroup, HlmFieldLabel, HlmFieldSeparator } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { injectQueryParams } from 'ngxtension/inject-query-params';
interface LoginData {
	email: string;
	password: string;
}

@Component({
	selector: 'cv-login',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
		provideIcons({
			lucideAlertTriangle
		})
	],
	imports: [
		HlmCardImports,
		HlmInput,
		HlmFieldLabel,
		NgIcon,
		FormsModule,
		HlmFieldError,
		HlmField,
		HlmButton,
		TranslatePipe,
		HlmAlertImports,
		HlmFieldSeparator,
		HlmLabel,
		HlmFieldGroup
	],
	templateUrl: './login.page.html',
	styleUrl: './login.page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
	protected loginModel: LoginData = {
		email: '',
		password: ''
	}
	private redirect = injectQueryParams('continue');
	private navigate = dispatch(Navigate);
	private readonly loginUser = dispatch(LoginUser);
	protected readonly credentialsSaved = select(credentialssaved);
	protected readonly failureMessage = signal<string>('');
	protected readonly loggingIn = isActionLoading(LoginUser);
	protected onFormSubmit(form: NgForm, event?: SubmitEvent) {
		event?.preventDefault();
		const { value } = form;
		this.failureMessage.set('');
		this.loginUser(value.username, value.password).subscribe({
			error: (e: Error) => {
				this.failureMessage.set(e.message);
			},
			complete: () => {
				const redirect = decodeURIComponent(this.redirect() ?? '/');
				this.navigate([redirect], undefined, { replaceUrl: true })
			}
		})
	}

	constructor() {
		effect(() => {
			console.log(this.credentialsSaved());
		})
	}
}
