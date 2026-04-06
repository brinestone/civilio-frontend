import { computed, Signal, untracked } from "@angular/core";
import {
	applyWhenValue,
	disabled,
	hidden,
	maxLength,
	metadata,
	minLength,
	pattern,
	required,
	SchemaPathTree,
} from "@angular/forms/signals";
import {
	FormItemField,
	FormVersionDefinition,
	NewFormItemField,
	RelevanceCondition,
	RelevanceDefinition,
	RelevanceLogicExpression,
	SubmissionData,
	TextFieldConfig,
} from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { LogicEngine } from "json-logic-engine";
import get from "lodash/get";
import keys from "lodash/keys";
import {
	HINT,
	isField,
	PLACEHOLDER,
	walkFormItemTree,
} from "../schema/form-designer-config";

function isTextFieldItem(
	config: Strict<FormItemField | NewFormItemField>["config"],
): config is Extract<typeof config, { type: "text" | "multiline" }> {
	return config.type == "text" || config.type == "multiline";
}

function asTextFieldItem(
	tree: Signal<Strict<FormItemField | NewFormItemField>>,
) {
	return tree as unknown as Signal<
		Strict<(FormItemField | NewFormItemField) & { config: TextFieldConfig }>
	>;
}

function defineTextFieldItemSchema(
	fieldDef: Signal<Strict<FormItemField | NewFormItemField>>,
) {
	return (data: SchemaPathTree<Strict<unknown>>) => {
		const config = fieldDef().config;
		if (isTextFieldItem(config)) {
			const textData = data as unknown as SchemaPathTree<string>;
			const textFieldSignal = asTextFieldItem(fieldDef);
			required(data, {
				message: "This field is required",
				when: () => fieldDef().config.required,
			});
			metadata(
				data,
				PLACEHOLDER,
				() => textFieldSignal().config.placeholder ?? undefined,
			);
			metadata(
				data,
				HINT,
				() => textFieldSignal().config.description ?? undefined,
			);
			maxLength(
				textData,
				() => textFieldSignal().config.maxlength ?? undefined,
			);
			minLength(
				textData,
				() => textFieldSignal().config.minlength ?? undefined,
			);
			disabled(textData, () => textFieldSignal().config.readonly ?? false);
			pattern(textData, () => {
				const p = textFieldSignal().config.pattern;
				return p ? new RegExp(p) : undefined;
			});
		}
	};
}

export function defineFormRendererFormSchema(
	def: Signal<Strict<FormVersionDefinition>>,
	relevanceEvaluator: (data: SubmissionData, logic: any) => boolean
) {
	const fieldDefs = new Map<
		string,
		Signal<Strict<FormItemField | NewFormItemField>>
	>();
	for (const item of untracked(def).items) {
		walkFormItemTree(item, (i) => {
			if (i.type == "field") {
				fieldDefs.set(
					i.config.dataKey,
					computed(() => get(def().items, i.path)),
				);
			}
		});
	}
	return (data: SchemaPathTree<Strict<SubmissionData>>) => {
		const dataKeys = keys(data);
		for (const dataKey of dataKeys) {
			const fieldDef = fieldDefs.get(dataKey);
			if (!fieldDef) continue;
			applyWhenValue(
				data[dataKey] as any,
				isField,
				defineTextFieldItemSchema(fieldDef),
			);
			hidden(data[dataKey] as any, () => {
				// const relevance = fieldDef().relevance;
				// if (!relevance.enabled) return false;
				return false;
			});
		}
	};
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
