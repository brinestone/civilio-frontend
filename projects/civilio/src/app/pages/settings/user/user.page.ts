import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, email, Field, form, minLength, pattern, required, validateHttp } from '@angular/forms/signals';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppAbility } from '@app/adapters/casl';
import { UserService } from '@app/services/user.service';
import { UserAdded, UserDeleted } from '@app/store/auth';
import { apiBaseUrl } from '@app/store/selectors';
import { AbilityServiceSignal } from '@casl/angular';
import { UserInfoSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAsteriskSquare, lucideCircleAlert, lucideEye, lucideEyeOff, lucideLoader, lucideLock, lucidePencil, lucideSave, lucideTrash2, lucideUserPen, lucideX } from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select, Store } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldError, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmRadio, HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmH4 } from "@spartan-ng/helm/typography";
import { entries, omit, pickBy, sample, sampleSize, shuffle, values } from 'lodash';
import { toast } from 'ngx-sonner';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { of } from 'rxjs';

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
			lucideEye,
			lucideEyeOff,
			lucideX,
			lucideLock,
			lucideAsteriskSquare,
			lucideCircleAlert
		})
	],
	imports: [
		HlmRadioGroupImports,
		Field,
		HlmRadio,
		HlmH4,
		HlmSeparator,
		HlmAlertImports,
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
	private readonly route = inject(ActivatedRoute);
	private readonly ts = inject(TranslateService);
	private readonly navigate = dispatch(Navigate);
	private readonly userAdded = dispatch(UserAdded);
	private readonly store = inject(Store);
	private readonly data = injectRouteData();
	readonly username = input<string>(undefined, { alias: 'id' });

	private readonly userService = inject(UserService);

	protected roles = [
		{ name: 'user', label: 'roles.user.title', description: 'roles.user.description' },
		{ name: 'maintainer', label: 'roles.maintainer.title', description: 'roles.maintainer.description' },
		// { name: 'admin', label: 'roles.admin.title', description: 'roles.admin.description' },
	];
	protected readonly deleting = signal(false);
	protected readonly isNew = computed(() => this.data()?.['isNew'] === true);
	protected readonly editing = linkedSignal(() => {
		return this.isNew();
	});
	protected readonly savingChanges = signal(false);
	protected readonly updateErrorMessage = signal('');
	private apiBaseUrl = select(apiBaseUrl);
	protected abs = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);
	protected user = rxResource({
		params: () => ({ username: this.username(), isNew: this.isNew() }),
		stream: ({ params: { username, isNew } }) => {
			if (isNew || !username) return of(UserInfoSchema.parse({
				role: ['user'],
				fullName: '',
				email: '',
				isAdmin: false,
				username: '',
				password: ''
			}));
			return this.userService.findUserByUsername(username);
		}
	});
	protected formData = linkedSignal(() => ({
		names: this.user.value()?.fullName ?? '',
		email: this.user.value()?.email ?? '',
		role: this.user.value()?.role ?? '',
		username: this.user.value()?.username ?? '',
		password: ''
	}));
	protected formModel = form(this.formData, path => {
		required(path.password, { when: () => this.isNew(), message: 'validation.msg.field_required' });
		minLength(path.password, ctx => {
			return this.isNew() || (!this.isNew() && ctx.value().length > 0) ? 8 : 0;
		}, {
			message: 'validation.msg.short_password'
		});
		pattern(path.password, ctx => this.isNew() || (!this.isNew() && (ctx.value()?.length ?? 0) > 0) ? /[a-z]/ : /.*/, {
			message: 'validation.msg.no_lowercase'
		});
		pattern(path.password, ctx => this.isNew() || (!this.isNew() && (ctx.value()?.length ?? 0) > 0) ? /[A-Z]/ : /.*/, {
			message: 'validation.msg.no_uppercase'
		});
		pattern(path.password, ctx => this.isNew() || (!this.isNew() && (ctx.value()?.length ?? 0) > 0) ? /[0-9]/ : /.*/, {
			message: 'validation.msg.no_number'
		});
		pattern(path.password, ctx => this.isNew() || (!this.isNew() && (ctx.value()?.length ?? 0) > 0) ? /[^a-zA-Z0-9]/ : /.*/, {
			message: 'validation.msg.no_symbol',
		});

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
		this.updateErrorMessage.set('');
		event.preventDefault();
		if (!this.formModel().dirty()) return;
		const data = entries(this.formData()).reduce((acc, [k, v]) => {
			acc[k] = v.trim();
			return acc;
		}, {} as Record<string, string>) as ReturnType<typeof this.formData>;
		const pristine = omit({ ...this.user.value() }, '__caslType');
		if (!pristine) {
			return;
		}
		this.savingChanges.set(true);
		const isNew = this.isNew();
		const username = this.username();
		if (username && !isNew) {
			const diff = pickBy(data, (value, key: string) => value !== (pristine as any)[key]);
			this.userService.updateUser(username, diff).subscribe({
				error: (e: HttpErrorResponse) => {
					this.updateErrorMessage.set((e.error ?? e).message);
					this.savingChanges.set(false);
				}, complete: () => {
					this.savingChanges.set(false);
					this.user.reload();
					this.editing.set(false);
					this.formModel().reset();
				}
			});
		} else if (isNew) {
			this.userService.createUser(data).subscribe({
				error: (e: HttpErrorResponse) => {
					this.updateErrorMessage.set((e.error ?? e).message);
					this.savingChanges.set(false);
				},
				complete: () => {
					toast.success(this.ts.instant('msg.changes_saved.title'));
					this.savingChanges.set(false);
					this.userAdded();
					this.navigate(['..', data.username], undefined, { relativeTo: this.route });
				}
			});
		}
	}

	onDeleteButtonClicked() {
		this.deleting.set(true);
		this.userService.deleteUser(this.username()!).subscribe({
			error: (e: HttpErrorResponse) => {
				this.deleting.set(false);
				toast.error(this.ts.instant('msg.error.title'), { description: (e.error ?? e).message });
			},
			complete: () => {
				this.deleting.set(false);
				toast.success(this.ts.instant('msg.changes_saved.title'));
				this.store.dispatch(new UserDeleted(this.username()!))
				this.navigate(['..']);
			}
		})
	}

	constructor(title: Title, ts: TranslateService) {
		effect(() => {
			const isNew = this.isNew();
			if (isNew) {
				title.setTitle(ts.instant('settings.user.new_title'));
				title.setTitle(ts.instant('settings.user.new_title'));
			}
			const userName = this.user.value()?.fullName ?? 'User';
			title.setTitle(userName);
		})
	}

	protected generatePassword() {
		const sets = {
			lower: 'abcdefghijklmnopqrstuvwxyz',
			upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			nums: '0123456789',
			symbols: '!@#$%^&*()'
		};

		const allChars = values(sets).join('');
		const password = [
			sample(sets.lower),
			sample(sets.upper),
			sample(sets.nums),
			sample(sets.symbols)
		].concat(sampleSize(allChars, 4));

		this.formModel.password().setControlValue(shuffle(password).join(''));
	}
}
