import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, email, Field, form, required, validateHttp } from '@angular/forms/signals';
import { AppAbility } from '@app/adapters/casl';
import { UserService } from '@app/services/user.service';
import { apiBaseUrl } from '@app/store/selectors';
import { AbilityServiceSignal } from '@casl/angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAsteriskSquare, lucideLoader, lucideLock, lucidePencil, lucideSave, lucideTrash2, lucideUserPen, lucideX } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldError, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmRadio, HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmH4 } from "@spartan-ng/helm/typography";

@Component({
	selector: 'cv-user',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
		provideIcons({
			lucidePencil,
			lucideSave,
			lucideLoader,
			lucideUserPen,
			lucideTrash2,
			lucideX,
			lucideLock,
			lucideAsteriskSquare
		})
	],
	imports: [
		HlmRadioGroupImports,
		Field,
		HlmRadio,
		HlmH4,
		NgTemplateOutlet,
		NgIcon,
		HlmBadge,
		TranslatePipe,
		HlmFieldError,
		HlmFieldImports,
		HlmInput,
		HlmInputGroupImports,
		HlmSkeleton,
		HlmButton
	],
	templateUrl: './user.page.html',
	styleUrl: './user.page.scss',
})
export class UserPage {
	readonly username = input.required<string>({ alias: 'id' });
	readonly editing = signal(true);

	private readonly userService = inject(UserService);

	protected roles = [
		{ name: 'user', label: 'roles.user.title', description: 'roles.user.description' },
		{ name: 'maintainer', label: 'roles.maintainer.title', description: 'roles.maintainer.description' },
		// { name: 'admin', label: 'roles.admin.title', description: 'roles.admin.description' },
	];
	private apiBaseUrl = select(apiBaseUrl);
	protected abs = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);
	protected user = rxResource({
		params: () => this.username(),
		stream: ({ params: username }) => {
			return this.userService.findUserByUsername(username);
		}
	});
	protected formData = linkedSignal(() => ({
		names: this.user.value()?.fullName ?? '',
		email: this.user.value()?.email ?? '',
		role: this.user.value()?.role[0] ?? '',
		username: this.user.value()?.username ?? '',
		password: ''
	}));
	protected formModel = form(this.formData, path => {
		required(path.names, { message: 'validation.msg.field_required' });
		required(path.role, {
			when: () => {
				return this.abs.can('change-role', this.user.value() ?? 'User');
			}, message: 'validation.msg.field_required'
		});

		required(path.username, {
			message: 'validation.msg.field_required'
		});
		required(path.email, { message: 'validation.msg.field_required' });
		email(path.email, { message: 'validation.msg.invalid_email' });
		debounce(path.username, 200);
		debounce(path.email, 200);
		validateHttp(path.username, {
			request: ({ value }) => `${this.apiBaseUrl()}/auth/check-username?arg=${value()}&ctxOwner=${this.user.value()?.username}`,
			onSuccess: (response: { available: boolean }) => {
				if (!response.available && this.user.value()?.username.trim() !== this.formData().username.trim()) {
					return { message: 'validation.msg.username_taken', kind: 'username_taken' };
				}
				return null;
			},
			onError: (error) => {
				console.error(error);
				return { message: 'validation.msg.async_validation_failed', kind: 'networkError' }
			}
		});
		validateHttp(path.email, {
			request: ({ value }) => `${this.apiBaseUrl()}/auth/check-email?arg=${value()}&ctxOwner=${this.user.value()?.username}`,
			onSuccess: (response: { available: boolean }) => {
				if (!response.available) {
					return { message: 'validation.msg.email_taken', kind: 'email_taken' };
				}
				return null;
			},
			onError: (error) => {
				console.error(error);
				return { message: 'validation.msg.async_validation_failed', kind: 'networkError' }
			}
		})
	});

	protected onFormSubmit(event: Event) {
		debugger;
		event.preventDefault();
		console.log(this.formData());
	}
}
