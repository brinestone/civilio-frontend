import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, Signal, TemplateRef, untracked, viewChild } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { fieldTypeExpressionOperatorsMap, operatorsMap } from '@app/model/form';
import { RelevanceLogicExpression } from '@civilio/sdk/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertOctagon, lucideEllipsis, lucideGlobe, lucidePlus, lucideX } from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { produce } from 'immer';
import { values } from 'lodash';
import { FieldError } from '../../field-error/field-error.component';
import { injectFormItemSchemaContext, injectFormSchemaContext } from '../items';

@Component({
	selector: 'cv-form-item-relevance-config',
	viewProviders: [
		provideIcons({
			lucidePlus,
			lucideEllipsis,
			lucideX,
			lucideAlertOctagon,
			lucideGlobe,
		})
	],
	imports: [
		HlmDropdownMenuImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmFieldImports,
		HlmAlertImports,
		HlmButtonGroup,
		HlmButton,
		NgIcon,
		HlmIcon,
		NgTemplateOutlet,
		FieldError,
		HlmInput,
		FormField,
		HlmSwitch,
	],
	templateUrl: './form-item-relevance-config.component.html',
	styleUrl: './form-item-relevance-config.component.scss',
})
export class FormItemRelevanceConfig {
	private readonly formContext = injectFormSchemaContext();
	private readonly ctx = injectFormItemSchemaContext();
	protected readonly relevance = computed(() => this.ctx.fieldTree().relevance);
	protected readonly path = computed(() => this.ctx.fieldTree().path().value());
	protected readonly index = this.ctx.index;

	private readonly booleanExpressionValueTemplate = viewChild.required<TemplateRef<any>>('booleanExpressionValueTemplate');
	private readonly simpleDateExpressionValueTemplate = viewChild.required<TemplateRef<any>>('simpleDateExpressionValueTemplate');
	private readonly multiDateExpressionValueTemplate = viewChild.required<TemplateRef<any>>('multiDateExpressionValueTemplate');
	private readonly rangeDateExpressionValueTemplate = viewChild.required<TemplateRef<any>>('rangeDateExpressionValueTemplate');
	private readonly selectionExpressionValueTemplate = viewChild.required<TemplateRef<any>>('selectionExpressionValueTemplate');
	private readonly numberExpressionValueTemplate = viewChild.required<TemplateRef<any>>('numberExpressionValueTemplate');
	private readonly textExpressionValueTemplate = viewChild.required<TemplateRef<any>>('textExpressionValueTemplate');

	protected readonly patternPresets = [
		{ name: 'email', label: 'Email', icon: 'lucideAtSign', regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$` },
		{ name: 'phone', label: 'Phone', icon: 'lucidePhone', regex: `^(\\+?237|\\(\\+?237\\))?6([5679]|[2])\\d{7}$` },
		{ name: 'url', label: 'URL', icon: 'lucideGlobe', regex: `^((https?|ftps?):\\/\\/)?((\\d{1,3}\\.){3}\\d{1,3}|(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6})\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$` }
	]
	protected readonly expressionValueTemplates = {
		'boolean': this.booleanExpressionValueTemplate,
		'date': this.simpleDateExpressionValueTemplate,
		'date-time': this.simpleDateExpressionValueTemplate,
		'multi-date': this.multiDateExpressionValueTemplate,
		'date-range': this.rangeDateExpressionValueTemplate,
		'single-select': this.selectionExpressionValueTemplate,
		'multi-select': this.selectionExpressionValueTemplate,
		'float': this.numberExpressionValueTemplate,
		'integer': this.numberExpressionValueTemplate,
		'text': this.textExpressionValueTemplate,
		'multiline': this.textExpressionValueTemplate,
	} as Record<keyof typeof fieldTypeExpressionOperatorsMap, Signal<TemplateRef<any>>>;
	protected readonly fieldMap = this.formContext.allFields;
	protected readonly otherFieldsList = computed(() => {
		return values(this.formContext.allFields()).filter(f => f.path().value() !== untracked(this.path));
	});
	protected readonly fieldTypeExpressionOperatorsMap = fieldTypeExpressionOperatorsMap;
	protected readonly operatorsMap = operatorsMap;

	protected onAddConditionButtonClicked() {
		this.relevance().logic().value.update(logic => produce(logic, draft => {
			draft.unshift({ expressions: [], operator: 'or' });
		}));
		this.onAddExpressionButtonClicked(this.relevance().logic.length - 1);
	}
	protected onAddExpressionButtonClicked(conditionIndex: number) {
		this.relevance().logic[conditionIndex].expressions().value.update(expressions => produce(expressions, draft => {
			draft.unshift(RelevanceLogicExpression.parse({}) as any);
		}));
	}
	protected onremoveConditionButtonClicked(conditionIndex: number) {
		this.relevance().logic().value.update(logic => produce(logic, draft => {
			draft.splice(conditionIndex, 1);
		}));
	}
	protected onRemoveExpressionButtonClicked(conditionIndex: number, expressionIndex: number) {
		this.relevance().logic[conditionIndex].expressions().value.update(expressions => produce(expressions, draft => {
			draft.splice(expressionIndex, 1);
		}));
	}
	constructor() {
		effect(() => {
			console.log(this.relevance().logic().value());
			console.log(this.relevance().enabled().value());
			console.log(this.relevance().operator().value());
		})
	}
}
