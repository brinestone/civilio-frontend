import { httpResource } from '@angular/common/http';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { FormDefinitionInputSchema, FormDefinitionSchema } from '@app/model/form';
import { apiUrl } from '@app/store/selectors';
import { select } from '@ngxs/store';
import { defaultFormDefinitionSchemaValue, defineFormDefinitionFormSchema } from './form-schemas';

@Component({
	selector: 'cv-forms',
	viewProviders: [],
	imports: [],
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
	private readonly formModel = form(this.formData, defineFormDefinitionFormSchema({
		apiUrl: this.apiUrl,
		currentName: computed(() => this.formData().name)
	}))
}
