import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, Signal, TemplateRef, untracked, viewChild } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { FormItemDefinition, RelevanceDefinition, RelevanceLogicExpressionOperator } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEllipsis, lucideGlobe, lucidePlus, lucideX } from '@ng-icons/lucide';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmFieldGroup, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { produce } from 'immer';
import { values } from 'lodash';
import { FieldError } from '../../field-error/field-error.component';
import { injectFormItemContext } from '../items';

export const operatorsMap = {
	in: { label: 'Contains', operandCount: 1 },
	eq: { label: 'Equals', operandCount: 1 },
	ne: { label: 'Not equal to', operandCount: 1 },
	gt: { label: 'Greater than', operandCount: 1 },
	lt: { label: 'Less than', operandCount: 1 },
	lte: { label: 'Less than or equal to', operandCount: 1 },
	gte: { label: 'Greater than or equal to', operandCount: 1 },
	empty: { label: 'Is Empty', operandCount: 0 },
	between: { label: 'Is between', operandCount: 2 },
	match: { label: 'Matches', operandCount: 1 },
	isNull: { label: 'Has no value', operandCount: 0 },
	isNotNull: { label: 'Has a value', operandCount: 0 },
	checked: { label: 'Is Checked', operandCount: 0 },
	unchecked: { label: 'Is Unchecked', operandCount: 0 },
	selectedAny: { label: 'Contains any of', operandCount: 1 },
	selectedAll: { label: 'Contains all of', operandCount: 1 },
	noselection: { label: 'Has no selection', operandCount: 0 },
	before: { label: 'Is before', operandCount: 1 },
	after: { label: 'Is after', operandCount: 1 },
	afterOrOn: { label: 'Is after or on', operandCount: 1 },
	beforeOrOn: { label: 'Is before or on', operandCount: 1 },
} as Record<RelevanceLogicExpressionOperator, { label: string, operandCount: number }>;
export const fieldTypeExpressionOperatorsMap = {
	'boolean': ['checked', 'unchecked'],
	'date-time': ['between', 'before', 'after', 'afterOrOn', 'beforeOrOn', 'isNull'],
	'date': ['between', 'before', 'after', 'afterOrOn', 'beforeOrOn', 'isNull'],
	'multi-date': ['empty', 'in', 'between', 'before', 'after'],
	'date-range': ['isNull', 'before', 'after'],
	'single-select': ['selectedAny', 'selectedAll', 'noselection'],
	'multi-select': ['selectedAny', 'selectedAll', 'noselection'],
	'float': ['between', 'lt', 'gt', 'gte', 'lte', 'eq', 'ne', 'isNull'],
	'integer': ['between', 'lt', 'gt', 'gte', 'lte', 'eq', 'ne', 'isNull'],
	'geo-point': ['isNull', 'isNotNull'],
	'multiline': ['eq', 'ne', 'in', 'empty', 'match'],
	'text': ['eq', 'ne', 'in', 'empty', 'match'],
} as Record<string, (keyof typeof operatorsMap)[]>;

@Component({
	selector: 'cv-form-item-relevance-config',
	viewProviders: [
		provideIcons({
			lucidePlus,
			lucideEllipsis,
			lucideX,
			lucideGlobe,
		})
	],
	imports: [
		HlmDropdownMenuImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmFieldImports,
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
	hostDirectives: [
		HlmFieldGroup
	],
	templateUrl: './form-item-relevance-config.component.html',
	styleUrl: './form-item-relevance-config.component.scss',
})
export class FormItemRelevanceConfig {
	readonly relevance = input.required<FieldTree<Strict<RelevanceDefinition>>>();
	readonly itemIndex = input.required<number>({ alias: 'index' });
	readonly item = input.required<FieldTree<Strict<FormItemDefinition>>>();

	private readonly context = injectFormItemContext();

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
		{ name: 'url', label: 'URL', icon: 'lucideGlobe', regex: `^((https?|ftp):\\/\\/)?((\\d{1,3}\\.){3}\\d{1,3}|(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6})\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$` }
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
	protected readonly fieldMap = this.context.allFields;
	protected readonly otherFieldsList = computed(() => {
		return values(this.context.allFields()).filter(f => f.path().value() !== untracked(untracked(this.item).path().value));
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
			draft.unshift({ field: null as any, operator: null as any, value: null as any });
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
}
