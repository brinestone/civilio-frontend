import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { FormService2 } from '@app/services/form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFormInput, lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmH3 } from "@spartan-ng/helm/typography";

@Component({
	selector: 'cv-forms-definition-layout',
	viewProviders: [
		provideIcons({
			lucideFormInput,
			lucidePlus
		})
	],
	imports: [
		HlmEmptyImports,
		RouterOutlet,
		NgIcon,
		RouterLink,
		HlmButton,
		HlmH3
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form-schemas.layout.component.html',
	styleUrl: './form-schemas.layout.component.scss',
})
export class SchemasLayout {
	private readonly formService = inject(FormService2);
	protected readonly route = inject(ActivatedRoute);
	protected readonly forms = resource({
		loader: async () => {
			const result = await this.formService.lookupFormDefinitions();
			return result ?? [];
		},
		defaultValue: []
	});
	protected readonly formsAvailable = computed(() => this.forms.value().length > 0);
}
