import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginUser, ReSignIn } from '@app/store/auth';
import { credentialssaved } from '@app/store/selectors';
import { isActionLoading } from '@app/util';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, dispatch, select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmField, HlmFieldError, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { toast } from 'ngx-sonner';
import { injectQueryParams } from 'ngxtension/inject-query-params';
interface LoginData {
	email: string;
	password: string;
}

@Component({
	selector: 'cv-login',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmCardImports,
		HlmInput,
		HlmFieldLabel,
		FormsModule,
		HlmFieldError,
		HlmField,
		HlmButton,
		TranslatePipe,
		HlmAlertImports,
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
	private ts = inject(TranslateService);
	private redirect = injectQueryParams('continue');
	private navigate = dispatch(Navigate);
	private readonly loginUser = dispatch(LoginUser);
	private readonly reLogin = dispatch(ReSignIn);
	protected readonly credentialsSaved = select(credentialssaved);
	protected readonly loggingIn = isActionLoading(LoginUser);
	protected onFormSubmit(form: NgForm, event?: SubmitEvent) {
		event?.preventDefault();
		const { value } = form;
		this.loginUser(value.username, value.password).subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant('msg.error.title'), { description: e.message });
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
