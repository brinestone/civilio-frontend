import { GeoPoint, NumberRange } from "@civilio/sdk/models";
import { QuestionConfig } from "@db/schemas";
import z from "zod";

export function buildValidatorSchemaFromConfig<TConfig extends QuestionConfig>(config: TConfig): z.ZodType {
	let schema: z.ZodType;
	switch (config.type) {
		case 'text':
		case 'multiline': {
			let s = z.string(config.required ? 'A value is required' : undefined).trim();
			if (config.minLength !== null && config.minLength !== undefined) s = s.min(config.minLength, { error: (ctx) => `Value must have at least ${ctx.minimum} characters` });
			if (config.maxLength !== null && config.maxLength !== undefined) s = s.max(config.maxLength, { error: (ctx) => `Value can only have at most ${ctx.maximum} characters` });
			if (config.pattern) s = s.regex(new RegExp(config.pattern), { error: () => `Value is invalid` });
			schema = !config.required ? s.nullish() : s.nonempty('A value is required');
			break;
		}

		case 'integer':
		case 'float': {
			let s = z.number(config.required ? 'A value is required' : undefined);
			if (config.type === 'integer') s = s.int(config.required ? 'A value is required' : undefined);
			if (config.min !== null && config.min !== undefined) s = s.min(config.min, { error: ctx => `Value cannot be less than ${ctx.minimum}` });
			if (config.max !== null && config.max !== undefined) s = s.max(config.max, { error: ctx => `Value cannot be greater than ${ctx.maximum}` });
			schema = !config.required ? s.nullish() : s;
			break;
		}

		case 'date':
		case 'date-time': {
			let s = z.number(); // Assuming epoch timestamps based on your config types
			if (config.min !== null && config.min !== undefined) s = s.min(config.min, { error: ctx => `Value cannot be before ${new Date(Number(ctx.minimum)).toLocaleDateString()}` });
			if (config.max !== null && config.max !== undefined) s = s.max(config.max, { error: ctx => `Value cannot be after ${new Date(Number(ctx.maximum)).toLocaleDateString()}` });
			schema = config.required ? s : s.nullish();
			break;
		}

		case 'multi-date': {
			let itemSchema = z.number();
			if (config.min !== null && config.min !== undefined) itemSchema = itemSchema.min(config.min);
			if (config.max !== null && config.max !== undefined) itemSchema = itemSchema.max(config.max);

			let s = z.array(itemSchema);
			if (config.minSelection !== null && config.minSelection !== undefined) s = s.min(config.minSelection);
			if (config.maxSelection !== null && config.maxSelection !== undefined) s = s.max(config.maxSelection);
			schema = s;
			break;
		}

		case 'single-select': {
			schema = config.required ? z.string() : z.string().nullish();
			break;
		}

		case 'multi-select': {
			schema = z.array(z.string());
			break;
		}

		case 'geo-point': {
			schema = config.required ? GeoPoint : GeoPoint.nullish();
			break;
		}

		case 'date-range': {
			schema = config.required ? NumberRange : NumberRange.nullish();
			break;
		}

		default:
			schema = z.any();
	}

	return schema;
}
