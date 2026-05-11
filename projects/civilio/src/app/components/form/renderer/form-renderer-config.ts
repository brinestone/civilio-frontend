import { Signal, untracked } from "@angular/core";
import { AbstractControl, FormControl, ValidatorFn, Validators } from "@angular/forms";
import {
	apply,
	applyWhenValue,
	maxLength,
	metadata,
	minLength,
	pattern,
	readonly,
	required,
	schema,
	SchemaPathTree
} from "@angular/forms/signals";
import {
	FormItemField,
	RelevanceCondition,
	RelevanceDefinition,
	RelevanceLogicExpression,
	SubmissionData,
	TextFieldConfig
} from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import {
	HINT,
	PLACEHOLDER
} from "../schema/form-designer-config";

export function toFormControl(config: Strict<FormItemField>['config']) {
	const control = new FormControl<typeof config.defaultValue>({ disabled: config.readonly, value: config.defaultValue ?? undefined })
	const validators: ValidatorFn[] = [];

	if (config.required)
		validators.push(Validators.required);
	if (isTextField(config)) {
		validators.push(...textFieldControlValidators(config))
	}

	control.setValidators(validators);
	return control;
}



function textFieldControlValidators(config: TextFieldConfig) {
	const validators: ValidatorFn[] = [];
	if (config.maxlength !== null && config.maxlength !== undefined) {
		validators.push(Validators.maxLength(config.maxlength))
	}
	if (config.minlength !== null && config.minlength !== undefined) {
		validators.push(Validators.minLength(config.minlength))
	}
	if (config.pattern) {
		validators.push(Validators.pattern(config.pattern));
	}
	return validators
}

function isTextField(
	config: Strict<FormItemField>["config"],
): config is Extract<typeof config, { type: "text" | "multiline" }> {
	return config.type == "text" || config.type == "multiline";
}

export function textFieldSchema(config: Strict<TextFieldConfig>) {
	return () => schema<string>(path => {
		debugger;
		required(path, { message: 'This field is required', when: () => config.required === true });
		metadata(path, PLACEHOLDER, () => config.placeholder);
		metadata(path, HINT, () => config.description);
		minLength(path, () => config.minlength, { message: `No less than ${config.minlength} are allowed in this field` });
		maxLength(path, () => config.maxlength, { message: `No more thant ${config.minlength} are allowed in this field` });
		readonly(path, () => config.readonly);
		pattern(path, () => config.pattern ? new RegExp(config.pattern) : undefined, { message: 'Invalid value format' });
	});
}

export function defineFieldSchemas(
	def: Signal<Strict<FormItemField>[]>,
	relevanceEvaluator: (data: SubmissionData, logic: any) => boolean
) {
	return (paths: SchemaPathTree<SubmissionData>) => {
		applyWhenValue(paths, value => {
			return Object.keys(value).length > 0;
		}, paths => {
			const fields = untracked(def);
			for (const field of fields) {
				const config = field.config;
				if (isTextField(config)) {
					apply(paths[config.dataKey] as SchemaPathTree<string>, textFieldSchema(config));
				}
			}
		});
	}
}

function relevanceToJsonLogic(relevance: Strict<RelevanceDefinition>) {
	const rules = {} as Record<string, unknown>;
}

function conditionToJsonLogic(condition: Strict<RelevanceCondition>) { }

function expressionToJsonLogic({
	operator,
	field,
	value,
	negated
}: Strict<RelevanceLogicExpression>) {
	const selector = { var: field };
	switch (operator) {
		case 'in':
			return { 'in': [selector, value] };
		case 'eq': return { '==': [selector, value] };
		case 'ne': return { '!=': [selector, value] };
		case 'before':
		case 'lt': return { '<': [selector, Number(value)] };
		case 'beforeOrOn':
		case 'lte': return { '<=': [selector, Number(value)] };
		case 'afterOrOn':
		case 'gte': return { '>=': [selector, Number(value)] };
		case 'empty': return { 'empty': [selector, value] };
		case 'notEmpty': return { 'empty': [selector, value], '!': true };
		case 'between':
			const [min, max] = value as unknown as [number, number];
			return { and: [{ '>=': [selector, min] }, { '<=': [selector, max] }] };
		case 'match': return { 'regexp': [selector, value] };
		case 'isNull': return { '==': [selector, null] };
		case 'isNotNull': return { '!=': [selector, null] };
		case 'checked': return { '==': [selector, true] };
		case 'unchecked': return { '==': [selector, false] };
		case 'selectedAny':
			return { in: [selector, value] };
		case 'selectedAll':
			return {
				and: (value as unknown as any[]).map((v) => ({
					in: [v, selector],
				})),
			};
		case 'startsWith':
			return { startsWith: [selector, value] };
		case 'endsWith':
			return { endsWith: [selector, value] };
		case 'noselection':
			return { "==": [{ "length": selector }, 0] };
		case 'after':
		case 'gt':
			return { '>': [selector, Number(value)] };
	}
}

function expressionOperatorToJsonLogicOperator(
	operator: Strict<RelevanceLogicExpression["operator"]>,
) {
	switch (operator) {
		case "in":
			return "in";
		case "eq":
			return "==";
		case "ne":
			return "!=";
		case "gt":
			return ">";
		case "lt":
			return "<";
		case "lte":
			return "<=";
		case "gte":
			return ">=";
		case "empty":
			return "==";
		case "notEmpty":
			return "!=";
		case "between":
			return "between";
		case "match":
			return "regexp";
		case "isNull":
			return "==";
		case "isNotNull":
			return "!=";
		case "checked":
			return "==";
		case "unchecked":
			return "!=";
		case "selectedAny":
			return "in";
		case "selectedAll":
			return "in";
		case "startsWith":
			return "startsWith";
		case "endsWith":
			return "endsWith";
		case "noselection":
			return "==";
		case "before":
			return "before";
		case "after":
			return "after";
		case "afterOrOn":
			return "afterOrOn";
		case "beforeOrOn":
			return "beforeOrOn";
		default:
			return operator;
	}
}
