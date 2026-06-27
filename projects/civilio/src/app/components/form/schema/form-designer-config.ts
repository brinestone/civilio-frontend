import {
	apply,
	applyEach,
	applyWhen,
	applyWhenValue,
	createMetadataKey,
	debounce,
	disabled,
	FieldTree,
	hidden,
	max,
	maxLength,
	min,
	minLength,
	pattern,
	required,
	SchemaPath,
	SchemaPathTree,
	validate
} from "@angular/forms/signals";
import { RelevanceLogicExpressionInputSchema } from "@app/model/form/schemas";
import {
	BooleanFieldConfig,
	FormItemDefinition,
	FormItemField,
	FormItemGroup,
	FormItemImage,
	FormVersionDefinition,
	GeoPointFieldConfig,
	MultiDateFieldConfig,
	NewFormItemDefinition,
	NewFormItemField,
	NewFormItemGroup, NewFormItemImage,
	NumberFieldConfig,
	RangeDateFieldConfig,
	RelevanceCondition,
	RelevanceDefinition,
	SelectFieldConfig,
	SimpleDateFieldConfig
} from "@civilio/sdk/models";

import { Strict } from "@civilio/shared";
import { Entity } from "@db/collections";
import { BooleanQuestionConfig, FormItem, GeoPointQuestionConfig, MultiDateQuestionConfig, NumberQuestionConfig, QuestionConfig, RangeDateQuestionConfig, SelectQuestionConfig, SimpleDateQuestionConfig, TextQuestionConfig } from "@db/schemas";
import { omit } from "lodash";
import z from "zod";

export type FormItemEntity = Entity<FormItem>;
export type FormItemType = FormItemEntity['type'];

export const formItemPathSeparator = ".";
export const StandardFacilityTagsSchema = z.enum({
	FacilityName: "tags::facility::name",
	FacilityLocation: "tags::facility::location",
	FacilityCoords: "tags::facility::coords",
	CreationDate: "tags::facility::createdAt",
});

const debounceDuration = 200;
export const PLACEHOLDER = createMetadataKey<string>();
export const HINT = createMetadataKey<string>();

export function walkFormItemTree(
	item: Strict<FormItemDefinition | NewFormItemDefinition>,
	cb: (i: typeof item) => void,
) {
	if (isGroup(item) && item.config.fields.length > 0) {
		for (const child of item.config.fields) {
			cb(child);
		}
		cb(omit(item, "config.fields") as any);
	} else cb(item);
}

function defineTextFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<TextQuestionConfig>>,
) {
	debounce(paths.pattern, debounceDuration);
	debounce(paths.maxLength, debounceDuration);
	debounce(paths.minLength, debounceDuration);
	debounce(paths.defaultValue, debounceDuration);
	min(paths.minLength, 0);
	hidden(paths.required, { when: ({ valueOf }) => valueOf(paths.readonly) === true });
	hidden(paths.maxLength, { when: ({ valueOf }) => valueOf(paths.readonly) === true });
	hidden(paths.minLength, { when: ({ valueOf }) => valueOf(paths.readonly) === true });
	hidden(paths.pattern, { when: ({ valueOf }) => valueOf(paths.readonly) === true });
	validate(paths.pattern, ({ value, valueOf }) => {
		const currentValue = value();
		if (!currentValue) return null;
		try {
			new RegExp(
				currentValue,
				valueOf(paths.type) == "multiline" ? "gm" : undefined,
			);
			return null;
		} catch (e) {
			console.error(e);
			return { message: "Invalid regular expression", kind: "regex" };
		}
	});
	validate(paths.maxLength, ({ valueOf, value }) => {
		const minlength = Number(valueOf(paths.minLength) ?? undefined);
		const currentValue = Number(value() ?? undefined);
		if (!minlength || !currentValue) return null;
		else if (currentValue - minlength <= 0)
			return {
				kind: "rangeError",
				message:
					"The maximum length cannot be less than or equal to the minimum length",
			};
		return null;
	});
	validate(paths.minLength, ({ valueOf, value }) => {
		const maxlength = Number(valueOf(paths.maxLength) ?? undefined);
		const currentValue = Number(value() ?? undefined);
		if (!maxlength || !currentValue) return null;
		else if (maxlength - currentValue <= 0)
			return {
				kind: "rangeError",
				message:
					"The minimum length cannot be greater than or equal to the maximum length",
			};
		return null;
	});
	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when a field is readonly",
	});
	applyWhen(
		paths.defaultValue,
		({ valueOf, stateOf }) =>
			!!valueOf(paths.maxLength) &&
			!stateOf(paths.maxLength).hidden() &&
			stateOf(paths.maxLength).valid(),
		(p) => {
			maxLength(
				p as SchemaPath<string, 1>,
				({ valueOf }) => Number(valueOf(paths.maxLength)),
				{
					message: ({ valueOf }) =>
						`Value cannot have more than ${valueOf(paths.maxLength)} characters`,
				},
			);
		},
	);
	applyWhen(
		paths.defaultValue,
		({ valueOf, stateOf }) =>
			!!valueOf(paths.minLength) &&
			!stateOf(paths.minLength).hidden() &&
			stateOf(paths.minLength).valid(),
		(p) => {
			minLength(
				p as SchemaPath<string, 1>,
				({ valueOf }) => Number(valueOf(paths.minLength)),
				{
					message: ({ valueOf }) =>
						`Value cannot have less than ${valueOf(paths.minLength)} characters`,
				},
			);
		},
	);
	pattern(
		paths.defaultValue,
		({ valueOf }) => {
			const pattern = valueOf(paths.pattern);
			try {
				if (!pattern) return undefined;
				return new RegExp(pattern);
			} catch {
				return undefined;
			}
		},
		{ message: "Invalid format" },
	);
}

function defineGeopointFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<GeoPointFieldConfig>>,
) {
	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when the field is marked readonly",
	});
}

function defineDateFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<SimpleDateFieldConfig>>,
) {
	max(paths.min, ({ valueOf }) => valueOf(paths.max) ?? undefined, {
		message: "The minimum date must be a date before the maximum date",
	});
	min(paths.max, ({ valueOf }) => valueOf(paths.min) ?? undefined, {
		message: "The maximum date must be a date after the minimum date",
	});
	min(
		paths.defaultValue,
		({ valueOf }) => valueOf(paths.min)?.valueOf() ?? undefined,
		{ message: "Value must be a date after or on the minimum date" },
	);
	max(
		paths.defaultValue,
		({ valueOf }) => valueOf(paths.max)?.valueOf() ?? undefined,
		{ message: "Value must be a date before or on the minimum date" },
	);
	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when field is marked readonly",
	});
}

function defineRangeDateFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<RangeDateFieldConfig>>,
) {
	applyWhenValue(
		paths.defaultValue,
		(v) => !!v,
		(innerPaths) => {
			min(innerPaths.start, ({ valueOf }) => valueOf(paths.min) ?? undefined, {
				message: "The start date must be on or after the minimum date",
			});
			max(
				innerPaths.start,
				({ valueOf }) => valueOf(innerPaths.end) ?? undefined,
				{ message: "The start date must be on or before the end date" },
			);

			min(
				innerPaths.end,
				({ valueOf }) => valueOf(innerPaths.start) ?? undefined,
				{ message: "The end date must be on or after the start date" },
			);
			max(innerPaths.end, ({ valueOf }) => valueOf(paths.max) ?? undefined, {
				message: "The end date must be on or before the maximum date",
			});
			required(innerPaths.end, { message: "The end date is required" });
			required(innerPaths.start, { message: "The start date is required" });
		},
	);
	max(
		paths.min,
		({ valueOf }) => {
			const max = valueOf(paths.max);
			if (max === null) return undefined;
			return max - 60000;
		},
		{ message: "The minimum date must be a date before the maximum date" },
	);
	min(
		paths.max,
		({ valueOf }) => {
			const min = valueOf(paths.min);
			if (min === null) return undefined;
			return min + 60000;
		},
		{ message: "The maximum date must be a date after the minimum date" },
	);
	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when the field is readonly",
	});
	min(
		paths.defaultValue as any,
		({ valueOf }) => valueOf(paths.min) ?? undefined,
	);
	max(
		paths.defaultValue as any,
		({ valueOf }) => valueOf(paths.max) ?? undefined,
	);
}

function defineMultiDateFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<MultiDateFieldConfig>>,
) {
	max(
		paths.min,
		({ valueOf }) => {
			const max = valueOf(paths.max);
			if (max === null) return undefined;
			return max - 60000;
		},
		{ message: "The minimum date must be before the maximum" },
	);
	min(
		paths.max,
		({ valueOf }) => {
			const min = valueOf(paths.min);
			if (min === null) return undefined;
			return min + 60000;
		},
		{ message: "The maximum date must be before the minimum" },
	);
	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when the field is readonly",
	});
	minLength(
		paths.defaultValue as SchemaPath<number[]>,
		({ valueOf }) => (valueOf(paths.readonly) ? 1 : undefined),
		{ message: "At least one selection must be made when field is readonly" },
	);
	applyWhenValue(
		paths.defaultValue,
		(v) => (v?.length ?? 0) > 0,
		(schema) => {
			applyEach(schema as SchemaPath<number[]>, (s) => {
				min(s, ({ valueOf }) => valueOf(paths.min) ?? undefined, {
					message: "All selected dates must be after the minimum date",
				});
				max(s, ({ valueOf }) => valueOf(paths.max) ?? undefined, {
					message: "All selected dates must be before the maximum date",
				});
			});
			maxLength(
				schema as SchemaPath<number[]>,
				({ valueOf }) => valueOf(paths.maxSelection) ?? undefined,
				{
					message: ({ valueOf }) =>
						`At most ${valueOf(paths.maxSelection)} date${valueOf(paths.maxSelection) != 1 ? "s" : ""} can be selected`,
				},
			);
			minLength(
				schema as SchemaPath<number[]>,
				({ valueOf }) => valueOf(paths.minSelection) ?? undefined,
				{
					message: ({ valueOf }) =>
						`At least ${valueOf(paths.minSelection)} date${valueOf(paths.minSelection) != 1 ? "s" : ""} should be selected`,
				},
			);
		},
	);

	min(paths.minSelection, 0, { message: "Value cannot be less than zero" });
	max(
		paths.minSelection,
		({ valueOf }) => valueOf(paths.maxSelection) ?? undefined,
		{
			message: ({ valueOf }) =>
				`Value cannot be greater than ${valueOf(paths.maxSelection)}`,
		},
	);
	min(
		paths.maxSelection,
		({ valueOf }) => valueOf(paths.minSelection) ?? undefined,
		{
			message: ({ valueOf }) =>
				`Value cannot be less than ${valueOf(paths.minSelection)}`,
		},
	);
}

function defineNumberFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<NumberFieldConfig>>,
) {
	min(paths.max, ({ valueOf }) => valueOf(paths.min) ?? undefined, {
		message: "The maximum value cannot be less than the minimum value",
	});
	max(paths.min, ({ valueOf }) => valueOf(paths.max) ?? undefined, {
		message: "The minimum value cannot be greater than the maximum value",
	});
	min(paths.defaultValue, ({ valueOf }) => valueOf(paths.min) ?? undefined, {
		message: ({ valueOf }) => `Value cannot be less than ${valueOf(paths.min)}`,
	});
	max(paths.defaultValue, ({ valueOf }) => valueOf(paths.max) ?? undefined, {
		message: ({ valueOf }) =>
			`Value cannot be greater than ${valueOf(paths.max)}`,
	});
	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when the field is readonly",
	});

	hidden(paths.required, ({ valueOf }) => valueOf(paths.readonly) === true);
	hidden(paths.min, ({ valueOf }) => valueOf(paths.readonly) === true);
	hidden(paths.max, ({ valueOf }) => valueOf(paths.readonly) === true);
}

function defineSelectionFieldConfigFormSchema(
	paths: SchemaPathTree<Strict<SelectFieldConfig>>,
) {
	hidden(paths.itemSourceRef, () => true);
	applyEach(paths.hardItems, (innerPaths) => {
		debounce(innerPaths.label, debounceDuration);
		debounce(innerPaths.value, debounceDuration);

		required(innerPaths.label, { message: "A label is required" });
	});
	hidden(paths.required, ({ valueOf }) => valueOf(paths.readonly) === true);

	required(paths.defaultValue, {
		when: ({ valueOf }) => valueOf(paths.readonly) === true,
		message: "A default value is required when readonly is enabled",
	});
	disabled(
		paths.defaultValue,
		({ valueOf, stateOf }) =>
			(valueOf(paths.itemSourceRef) === null ||
				stateOf(paths.itemSourceRef).invalid()) &&
			(stateOf(paths.hardItems).invalid() ||
				(valueOf(paths.hardItems) ?? []).length == 0),
	);
}

function defineBooleanFieldConfigFormSchema(
	_: SchemaPathTree<Strict<BooleanFieldConfig>>,
) { }

export const isFieldTree = (
	v: FieldTree<Strict<FormItemDefinition | NewFormItemDefinition>>,
): v is FieldTree<Strict<FormItemField | NewFormItemField>> =>
	v.type().value() == "field";
export const isField = (
	v: Strict<Entity<FormItem>>,
): v is Strict<Entity<FormItem>> => v.type == "question";
export const isGroup = (
	v: Strict<FormItemDefinition | NewFormItemDefinition>,
): v is Strict<FormItemGroup | NewFormItemGroup> => v.type == "group";
export const isImage = (
	v: Strict<FormItemDefinition | NewFormItemDefinition>,
): v is Strict<FormItemImage | NewFormItemImage> => v.type == "image";
export function isExistingFormItem(
	v: Strict<FormItemDefinition | NewFormItemDefinition>,
): v is Strict<FormItemDefinition> {
	return "id" in v && "addedAt" in v && "updatedAt" in v;
}
function defineFieldItemDefinitionFormSchema(
	paths: SchemaPathTree<Strict<Entity<FormItem>>>,
) {
	apply(paths.config, (config) => {
		required(config.type, { message: "A field type must be specified" });
		hidden(config.required, ({ valueOf }) => valueOf(config.readonly) === true);

		const isText = (v: Strict<QuestionConfig>): v is Strict<TextQuestionConfig> =>
			v?.type == "text" || v?.type == "multiline";
		const isBoolean = (
			v: Strict<QuestionConfig>,
		): v is Strict<BooleanQuestionConfig> => v?.type === "boolean";
		const isGeo = (
			v: QuestionConfig,
		): v is Strict<GeoPointQuestionConfig> => v?.type === "geo-point";
		const isDate = (
			v: QuestionConfig,
		): v is Strict<SimpleDateQuestionConfig> =>
			v?.type === "date" || v?.type === "date-time";
		const isNumber = (
			v: QuestionConfig,
		): v is Strict<NumberQuestionConfig> =>
			v?.type == "float" || v?.type === "integer";
		const isSelection = (
			v: QuestionConfig,
		): v is Strict<SelectQuestionConfig> =>
			v?.type == "single-select" || v?.type == "multi-select";
		const isDateRange = (
			v: QuestionConfig,
		): v is Strict<RangeDateQuestionConfig> => v?.type == "date-range";
		const isMultiDate = (
			v: QuestionConfig,
		): v is Strict<MultiDateQuestionConfig> => v?.type == "multi-date";
		applyWhenValue(config, isText, defineTextFieldConfigFormSchema);
		applyWhenValue(config, isBoolean, defineBooleanFieldConfigFormSchema);
		applyWhenValue(config, isGeo, defineGeopointFieldConfigFormSchema);
		applyWhenValue(config, isDate, defineDateFieldConfigFormSchema);
		applyWhenValue(config, isNumber, defineNumberFieldConfigFormSchema);
		applyWhenValue(config, isSelection, defineSelectionFieldConfigFormSchema);
		applyWhenValue(config, isDateRange, defineRangeDateFieldConfigFormSchema);
		applyWhenValue(config, isMultiDate, defineMultiDateFieldConfigFormSchema);

		debounce(config.title, debounceDuration);
		debounce(config.description, debounceDuration);
		required(config.title, { message: "A title is required" });
		disabled(config.dataKey, ({ valueOf }) => valueOf(config.autoDataKey));
		hidden(config.readonly, ({ valueOf }) => valueOf(config.required));
		applyWhen(
			config.dataKey,
			({ valueOf }) => valueOf(config.autoDataKey) !== true,
			(p) => {
				pattern(p, /^[a-zA-Z0-9_-]+$/, {
					message:
						"Data key must contain only letters, numbers, underscores or hyphens",
				});
				required(p, {
					message:
						"Data key is required when auto-generate data key is disabled",
				});
			},
		);
	});
}

// function defineGroupItemDefinitionFormSchema(
// 	paths: SchemaPathTree<Strict<FormItemGroup | NewFormItemGroup>>,
// ) {
// 	hidden(
// 		paths.metaTag,
// 		({ valueOf }) => valueOf(paths.config.repeatable) === true,
// 	);
// 	apply(paths.config, (config) => {
// 		required(config.title, { message: "A field group must have a title" });
// 		metadata(
// 			config.repeatable,
// 			HINT,
// 			() => "Whether or not this group can have multiple rows of data",
// 		);
// 		metadata(config.title, PLACEHOLDER, () => "Group Title");
// 		metadata(
// 			config.title,
// 			HINT,
// 			() => "A user facing title for this group of fields",
// 		);
// 		metadata(config.description, PLACEHOLDER, () => "Subtitle or description");
// 		min(config.divisionCount, 0);
// 		required(config.orientation, {
// 			message: "An orientation must be specified",
// 		});
// 		metadata(
// 			config.repeatable,
// 			HINT,
// 			() => "Whether or not this group can have multiple rows of data",
// 		);

// 		applyEach(config.fields, defineFieldItemDefinitionFormSchema);
// 	});
// }

function defineImageItemDefinitionFormSchema(
	paths: SchemaPathTree<Strict<FormItemImage | NewFormItemImage>>,
) {
	apply(paths.config, (paths) => {
		min(paths.width, 142);
		max(paths.width, 436);
		min(paths.height, 144);
		max(paths.height, 438);
	});
}

function defineFormItemDefinitionFormSchema(
	paths: SchemaPathTree<Strict<Entity<FormItem>>>,
) {
	hidden(paths.createdAt, () => true);
	hidden(paths.updatedAt, () => true);
	hidden(paths.id, () => true);
	hidden(paths.formVersion, () => true);
	hidden(paths.type, () => true);
	hidden(paths.path, () => true);

	applyWhenValue(paths, isField, defineFieldItemDefinitionFormSchema);
	// applyWhenValue(paths, isExistingFormItem, (paths) => {
	// 	hidden(paths.id, () => true);
	// 	hidden(paths.addedAt, () => true);
	// 	hidden(paths.updatedAt, () => true);
	// 	hidden(paths.itemId, () => true);
	// });
	// hidden(paths.path, () => true);
	// hidden(paths.type, () => true);

	// applyWhenValue(paths, isField, defineFieldItemDefinitionFormSchema);
	// applyWhenValue(paths, isGroup, defineGroupItemDefinitionFormSchema);
	// applyWhenValue(paths, isImage, defineImageItemDefinitionFormSchema);
}

export function defineFormDesignerFormSchema() {
	return (paths: SchemaPath<Strict<Entity<FormItem>>[]>) => {
		applyEach(paths, defineFormItemDefinitionFormSchema);
	}
}

export function domainToStrictFormDefinition(value: FormVersionDefinition) {
	return FormVersionDefinition.parse(value) as unknown as Strict<typeof value>;
}

export function defaultFormItemDefinitionSchemaValue(
	path: string,
	id: string,
	type: FormItemType,
	formVersion: string,
	parentId?: string
) {
	const config = formItemDefaultConfig(type);
	return FormItem.parse({
		parentId,
		id,
		config,
		path,
		relevance: defaultFormItemRelevanceSchemaValue(),
		tags: [],
		formVersion,
		type,
	});
}

function defaultFormItemRelevanceSchemaValue() {
	return RelevanceDefinition.parse({})
}

export function formItemDefaultConfig(type: FormItemType) {
	switch (type) {
		case 'question':
			return TextQuestionConfig.parse({ type: 'text' })
		// case "field":
		//   return FieldItemConfig.parse({ type: "text" });
		// case "group":
		//   return GroupItemConfig.parse({});
		// case "note":
		//   return NoteItemConfig.parse({ fontSize: 13 });
		// case "separator":
		//   return SeparatorItemConfig.parse({});
		// case "image":
		//   return ImageItemConfig.parse({});
		default:
			throw new Error("Unknown form item type");
	}
}

export function defaultRelevanceExpression() {
	return RelevanceLogicExpressionInputSchema.parse({});
}

export function defaultRelevanceLogic(
	operator: RelevanceCondition["operator"] = "and",
) {
	return {
		expressions: [defaultRelevanceExpression()],
		operator,
	} as Strict<RelevanceCondition>;
}
