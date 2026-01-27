import { NgTemplateOutlet } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, effect, input, linkedSignal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { FormDefinitionInputSchema, FormDefinitionSchema } from '@app/model/form';
import { apiUrl } from '@app/store/selectors';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { defaultFormDefinitionSchemaValue, defineFormDefinitionFormSchema } from './form-schemas';
import { FormLogoUploadComponent } from '@app/components';

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
	readonly formName = input<string>();
	private readonly apiUrl = select(apiUrl);
	private readonly formDefinition = httpResource(() => !this.formName() ? undefined : `${this.apiUrl()}/forms/${this.formName()}/def`, { parse: v => FormDefinitionSchema.parse(v) })
	private readonly formData = linkedSignal(() => {
		const v = this.formDefinition.value();
		if (v) return FormDefinitionInputSchema.parse(v);
		return defaultFormDefinitionSchemaValue();
	});
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema({
		apiUrl: this.apiUrl,
		currentName: this.formName
	}));

	constructor() {
		effect(() => console.log(this.formData()));
	}
}
