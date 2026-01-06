import { httpResource } from '@angular/common/http';
import { Component, inject, input, linkedSignal } from '@angular/core';
import { applyEach, Field, form, required } from '@angular/forms/signals';
import { ChoiceGroupEditorComponent } from '@app/components';
import { FORM_SERVICE } from '@app/services/form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmH3 } from '@spartan-ng/helm/typography';
import z from 'zod';

const OptionSpecSchema = z.object({
	group: z.string(),
	items: z.object({
		name: z.string(),
		label: z.string(),
		parent: z.string().nullable(),
		i18n_key: z.string().nullable()
	}).array()
});
const ServerResponseSchema = OptionSpecSchema.array();
type ServerResponse = { groups: z.infer<typeof ServerResponseSchema> };

@Component({
	selector: 'cv-choice-editor',
	viewProviders: [
		provideIcons({
			lucidePlus,
		})
	],
	imports: [
		HlmFieldImports,
		ChoiceGroupEditorComponent,
		HlmH3,
		NgIcon,
		HlmButton,
		Field,
	],
	templateUrl: './choice-editor.page.html',
	styleUrl: './choice-editor.page.scss',
})
export class ChoiceEditorPage {
	protected form = input.required<string>();
	private readonly formService = inject(FORM_SERVICE);
	protected readonly options = httpResource<ServerResponse>(() => `http://localhost:3000/api/forms/${this.form()}/options`)
	protected readonly formData = linkedSignal(() => this.options.value() ?? { groups: [] })
	protected readonly formModel = form(this.formData, path => {
		applyEach(path.groups, s => {
			required(s.group, { message: 'This field is required' });
			applyEach(s.items, ss => {
				required(ss.name, { message: 'This field is required' });
				required(ss.label, { message: 'This field is required' });
			})
		});
	})
}
