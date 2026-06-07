import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, OnDestroy, Type } from '@angular/core';
import { FormItemField } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { HlmFieldGroup } from '@spartan-ng/helm/field';
import { injectWithForm, TanStackWithForm } from '@tanstack/angular-form';
import { submissionDataFormOptions } from '../../../form-renderer-config';
import { BaseItemRenderer } from '../../base-item-renderer';
import { createRenderedFieldItemContextInjector } from '../../context';

@Component({
	selector: 'cv-field-item-renderer',
	templateUrl: './field-item-renderer-wrapper.html',
	styleUrl: './field-item-renderer-wrapper.scss',
	imports: [
		AsyncPipe,
		NgComponentOutlet,
		HlmFieldGroup,

	],
	hostDirectives: [
		{
			directive: TanStackWithForm,
			inputs: ['form']
		}
	]
})
export class FieldItemRendererWrapper extends BaseItemRenderer<Strict<FormItemField>, any> implements OnDestroy {
	protected readonly withForm = injectWithForm(submissionDataFormOptions);
	protected readonly config = computed(() => this.itemDefinition().config)
	protected readonly renderers = {
		text: () => import('../text/text-field-renderer').then(m => m.TextFieldRenderer)
	} as Record<string, () => Promise<Type<any>>>;
	protected readonly rendererProvider = computed(() => {
		return this.renderers[this.itemDefinition().config.type]?.();
	});
	private fieldId = computed(() => `${this.path()}__${this.itemDefinition().parentId ? (this.index() + '__') : ''}${this.itemDefinition().config.dataKey}`)
	protected readonly fieldContextInjector = createRenderedFieldItemContextInjector({
		// rootForm: this._form,
		fieldId: this.fieldId
	}, this.formItemContextInjector);

	ngOnDestroy() {
		this.fieldContextInjector.destroy();
		this.formItemContextInjector.destroy();
	}
}
