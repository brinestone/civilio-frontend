import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { FormDefinitionLookupSchema } from '@app/model/form';
import { apiUrl } from '@app/store/selectors';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFormInput, lucidePlus } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
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
	templateUrl: './form-schemas.layout.component.html',
	styleUrl: './form-schemas.layout.component.scss',
})
export class SchemasLayout {
	private readonly apiUrl = select(apiUrl);
	protected readonly route = inject(ActivatedRoute);
	protected readonly forms = httpResource(() => `${this.apiUrl()}/forms/def`, { parse: v => FormDefinitionLookupSchema.array().parse(v), defaultValue: [] });
	protected readonly formsAvailable = computed(() => this.forms.value().length > 0);
}
