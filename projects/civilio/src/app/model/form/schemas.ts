import { AllFieldKeysSchema, AllSectionKeysSchema, OptionSchema } from "@civilio/shared";
import z from "zod";

const FieldValueBaseSchema = z.union([z.string(), z.number(), z.date(), z.boolean(), OptionSchema]);
const FieldValueSchema = z.union([FieldValueBaseSchema, FieldValueBaseSchema.array()]);
export const ValueProviderFnSchema = z.function({
  input: z.tuple([AllFieldKeysSchema], AllFieldKeysSchema),
  output: z.record(AllFieldKeysSchema, FieldValueSchema.array())
});
export const RelevanceFnSchema = z.function({
  input: [ValueProviderFnSchema],
  output: z.boolean()
});
const ValidateFnSchema = z.function({
  input: [FieldValueSchema],
  output: z.union([z.null(), z.string()])
});

const BaseFieldDefinitionSchema = z.object({
  key: AllFieldKeysSchema,
  required: z.literal(true).optional(),
  validate: ValidateFnSchema.optional(),
  relevance: RelevanceFnSchema.optional()
});

const TextFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  type: z.literal('text'),
  pattern: z.string().optional(),
  autocomplete: z.boolean().optional(),
  multiline: z.boolean().optional(),
  validValues: z.string().array().optional()
})

const SelectionFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  optionsGroupKey: z.string(),
  parent: AllFieldKeysSchema.optional(),
  type: z.union([z.literal('single-selection'), z.literal('multi-selection')])
});

const DateFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  type: z.literal('date'),
  min: z.union([z.iso.date(), z.number()]).optional(),
  max: z.union([z.iso.date(), z.number()]).optional(),
});

const GeoPointFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  type: z.literal('point'),
})

const BooleanFieldDefinitionSchema = BaseFieldDefinitionSchema.omit({
  required: true
}).extend({
  type: z.literal('boolean'),
});

const NumberFieldDefinitionSchema = BaseFieldDefinitionSchema.extend({
  type: z.union([z.literal('float'), z.literal('int')]),
  min: z.number().optional(),
  max: z.number().optional()
})

const FieldDefinitionSchema = z.discriminatedUnion('type', [
  BooleanFieldDefinitionSchema,
  GeoPointFieldDefinitionSchema,
  DateFieldDefinitionSchema,
  SelectionFieldDefinitionSchema,
  TextFieldDefinitionSchema,
  NumberFieldDefinitionSchema
])

const GroupBaseSchema = z.object({
  id: AllSectionKeysSchema.optional(),
  fields: FieldDefinitionSchema.array(),
  relevance: RelevanceFnSchema.optional()
});
export const FormGroupSchema = GroupBaseSchema.extend({
  children: GroupBaseSchema.array().optional(),
});

export type GroupDefinition = z.output<typeof FormGroupSchema>;

export const FormModelDefinitionSchema = z.object({
  sections: FormGroupSchema.array()
});
export type FieldDefinition = z.output<typeof FieldDefinitionSchema>;
export type FormModelDefinition = z.output<typeof FormModelDefinitionSchema>;
export type FormSection = z.output<typeof FormGroupSchema>;
