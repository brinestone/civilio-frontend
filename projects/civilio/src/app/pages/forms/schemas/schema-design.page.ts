import { NgTemplateOutlet } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, effect, inject, input, linkedSignal, resource } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { FormLogoUploadComponent } from '@app/components';
import { FormDefinitionInputSchema, FormDefinitionSchema } from '@app/model/form';
import { FormService2 } from '@app/services/form';
import { apiUrl } from '@app/store/selectors';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { defaultFormDefinitionSchemaValue, defineFormDefinitionFormSchema } from './form-schemas';

@Component({
	selector: 'cv-forms',
	viewProviders: [
		provideIcons({
			lucideLoader
		}),
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmFieldImports,
		HlmInput,
		HlmButton,
		NgIcon,
		FormLogoUploadComponent,
		FormField,
		NgTemplateOutlet,
	],
	templateUrl: './schema-design.page.html',
	styleUrl: './schema-design.page.scss',
})
export class SchemaDesignPage {
	readonly slug = input<string>();
	private readonly formService = inject(FormService2);
	private readonly formDefinition = resource({
		params: () => ({ slug: this.slug() }),
		loader: async ({ params }) => {
			if (!params.slug) return undefined;
			return await this.formService.findFormDefinition(params.slug);
		}
	})
	private readonly formData = linkedSignal(() => {
		const v = this.formDefinition.value();
		if (v) return FormDefinitionInputSchema.parse(v);
		return defaultFormDefinitionSchemaValue();
	});
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema());

	constructor() {
		effect(() => console.log(this.formData()));
	}
}
