import { Component, input, linkedSignal, output } from '@angular/core';
import { debounce, disabled, form, FormField, required, validate, validateHttp } from '@angular/forms/signals';
import { ApiServerInfo } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader, lucideSearch } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import z from 'zod';

@Component({
	selector: 'cv-api-config-form',
	viewProviders: [
		provideIcons({
			lucideSearch,
			lucideLoader
		})
	],
	imports: [
		HlmFieldImports,
		HlmInput,
		HlmButton,
		NgIcon,
		TranslatePipe,
		FormField
	],
	templateUrl: './api-config-form.component.html',
	styleUrl: './api-config-form.component.scss',
})
export class ApiConfigFormComponent {
	readonly apiInfo = input<ApiServerInfo>();
	readonly discover = output();
	readonly discovering = input<boolean>();
	protected readonly formData = linkedSignal(() => ({
		baseUrl: this.apiInfo()?.baseUrl ?? ''
	}) as ApiServerInfo);
	protected readonly formModel = form(this.formData, paths => {
		debounce(paths.baseUrl, 200);
		required(paths.baseUrl, { message: 'Base URL is required' });
		validate(paths.baseUrl, ({ value }) => {
			if (!z.url().safeParse(value()).success) return { message: 'Invalid URL format', kind: 'formatError' };
			return null;
		});
		disabled(paths.baseUrl, () => this.discovering() ?? false)
		validateHttp<string, { ok: true }>(paths.baseUrl, {
			request: ({ value }) => `${value()}/health`,
			onSuccess: () => {
				return null;
			},
			onError: () => ({
				kind: 'networkError',
				message: 'Unable to reach the server: '
			})
		});
	});

	protected onFormSubmit(event: SubmitEvent) {
		event.preventDefault();
	}
}
