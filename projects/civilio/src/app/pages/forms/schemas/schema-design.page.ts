import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, linkedSignal, OnDestroy, OnInit, resource, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { FormLogoUploadComponent } from '@app/components';
import { FormService2 } from '@app/services/form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideCopyCheck, lucideEdit, lucideEye, lucideFormInput, lucideGroup, lucideInfo, lucideLoader, lucidePlus } from '@ng-icons/lucide';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { BrnHoverCard, BrnHoverCardContent, BrnHoverCardTrigger } from '@spartan-ng/brain/hover-card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmHoverCardContent } from '@spartan-ng/helm/hover-card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmH3 } from "@spartan-ng/helm/typography";
import { current, produce, setAutoFreeze } from 'immer';
import { defaultFormDefinitionSchemaValue, defaultFormItemDefinitionSchemaValue, defineFormDefinitionFormSchema, domainToStrictFormDefinition } from './form-schemas';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';

@Component({
	selector: 'cv-forms',
	viewProviders: [
		provideIcons({
			lucideLoader,
			lucideCopy,
			lucideEye,
			lucideInfo,
			lucideCopyCheck,
			lucideEdit,
			lucideFormInput,
			lucideGroup,
			lucidePlus
		}),
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
	],
	imports: [
		HlmFieldImports,
		HlmInput,
		HlmButtonGroup,
		HlmButton,
		BrnHoverCard,
		HlmHoverCardContent,
		BrnHoverCardTrigger,
		BrnHoverCardContent,
		NgIcon,
		FormLogoUploadComponent,
		FormField,
		HlmBadge,
		NgTemplateOutlet,
		HlmH3
	],
	templateUrl: './schema-design.page.html',
	styleUrl: './schema-design.page.scss',
})
export class SchemaDesignPage implements OnInit, OnDestroy {
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
		if (v) return domainToStrictFormDefinition(v);
		return defaultFormDefinitionSchemaValue();
	});
	protected readonly slugCopied = signal(false);
	protected readonly enableEditingControls = linkedSignal(() => !this.slug());
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema({
		enableEditing: this.enableEditingControls
	}));

	ngOnInit() {
		setAutoFreeze(false);
	}

	ngOnDestroy() {
		setAutoFreeze(true)
	}

	// protected async copyFormIdButtonClicked() {
	// 	await navigator.clipboard.writeText(this.formData().slug).then(() => {
	// 		this.slugCopied.set(true);
	// 		setTimeout(() => {
	// 			this.slugCopied.set(false);
	// 		}, 3000);
	// 	});
	// }

	protected toggleEditingButtonClicked() {
		this.enableEditingControls.update(v => !v);
	}

	protected addField(parent?: string) {
		this.formModel.items().setControlValue(produce(this.formModel.items().value(), draft => {
			const item = defaultFormItemDefinitionSchemaValue(current(draft).length);
			item.type = 'field';
			draft.push(item);
			if (parent) {
				item.parent.id = parent;
			}
		}))
	}

	protected addNote(parent?: string) {
		this.formModel.items().setControlValue(produce(this.formModel.items().value(), draft => {
			const item = defaultFormItemDefinitionSchemaValue(current(draft).length);
			item.type = 'note';
			draft.push(item);
			if (parent) {
				item.parent.id = parent;
			}
		}))
	}
}
