import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { Component, computed, OnDestroy, Type } from '@angular/core';
import { Strict } from '@civilio/shared';
import { QuestionType } from '@db/schemas';
import { FormItemEntity } from '@db/types';
import { HlmFieldGroup } from '@spartan-ng/helm/field';
import { injectWithForm, TanStackWithForm } from '@tanstack/angular-form';
import { submissionDataFormOptions } from '../../../form-renderer-config';
import { BaseItemRenderer } from '../../base-item-renderer';
import { createRenderedFieldItemContextInjector } from '../../context';
import { buildValidatorSchemaFromConfig } from '../config';

@Component({
	selector: 'cv-field-item-renderer',
	templateUrl: './field-item-renderer-wrapper.html',
	styleUrl: './field-item-renderer-wrapper.scss',
	imports: [
		AsyncPipe,
		NgComponentOutlet,
		HlmFieldGroup,
		NgTemplateOutlet
	],
	hostDirectives: [
		{
			directive: TanStackWithForm,
			inputs: ['form']
		}
	]
})
export class FieldItemRendererWrapper extends BaseItemRenderer<Strict<FormItemEntity>, any> implements OnDestroy {
	protected readonly withForm = injectWithForm(submissionDataFormOptions);
	protected readonly config = computed(() => this.itemDefinition().config);
	protected readonly renderers = {
		text: () => import('../text/text-field-renderer').then(m => m.TextFieldRenderer),
		integer: () => import('../number/number-field-renderer').then(m => m.NumberFieldRenderer),
		float: () => import('../number/number-field-renderer').then(m => m.NumberFieldRenderer),
	} as Record<QuestionType, () => Promise<Type<any>>>;
	protected readonly rendererProvider = computed(() => {
		return this.renderers[this.itemDefinition().config.type]?.();
	});
	protected readonly validatorSchema = computed(() => buildValidatorSchemaFromConfig(this.config()));
	private fieldId = computed(() => `${this.path()}__${this.itemDefinition().parentId ? (this.index() + '__') : ''}${this.itemDefinition().config.dataKey}`)
	protected readonly fieldContextInjector = createRenderedFieldItemContextInjector({
		fieldId: this.fieldId
	}, this.formItemContextInjector);

	ngOnDestroy() {
		this.fieldContextInjector.destroy();
		this.formItemContextInjector.destroy();
	}
}
