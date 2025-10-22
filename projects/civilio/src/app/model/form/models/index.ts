import { GeoPoint, GeopointSchema, Option } from '@civilio/shared';
import { formatISO } from 'date-fns';
import z from 'zod';
import { DefinitionLike, FieldSchema, FormSchema, SectionSchema } from '../schemas';

export * from './chiefdom';
export * from './csc';
export * from './fosa';

export function flattenSections(schema: FormSchema) {
	return schema.sections.flatMap(s => {
		return [s, ...(s.children ?? [])];
	})
}

export function lookupFieldSchema(key: string, model: FormSchema) {
	const allFields = extractAllFields(model);
	return allFields.find(f => f.key == key);
}

export function extractAllFields(schema: FormSchema) {
	const list = Array<FieldSchema>();

	for (const section of schema.sections) {
		list.push(...extractFields(section));
	}

	return list;
}

export function extractFields(section: SectionSchema) {
	const result = [...section.fields];
	if (section.children) {
		for (const child of section.children) {
			result.push(...extractFields(child as any));
		}
	}
	return result;
}

export function defaultValueForType(type: DefinitionLike['type']) {
	switch (type) {
		case 'boolean':
			return false;
		case 'date':
			return new Date();
		case 'float':
		case 'int':
			return 0;
		case 'multi-selection':
			return Array<Option>()
		case 'point':
			return GeopointSchema.parse({})
		case 'text':
			return '';
		default:
			return null;
	}
}

export type ParsedValue = boolean | null | Date | GeoPoint | number | string;
export type RawValue = (string | null)[] | string;

export function serializeValue(definition: DefinitionLike, value: any): any {
	if (value == null) return null;
	if (Array.isArray(value) && definition.type == 'table') {
		return value.map(serializeValue);
	}
	switch (definition.type) {
		case 'boolean': return value === true ? '1' : '2';
		case 'multi-selection': return value.join(' ');
		case 'date': {
			if (value instanceof Date) {
				return formatISO(value, { representation: 'date' });
			} return z.iso.date().nullable().parse(value);
		}
		case 'point': return `${value.lat} ${value.long}`;
		default: return String(value);
	}
}

export function parseValue(definition: DefinitionLike, raw: RawValue | null): ParsedValue | ParsedValue[] {
	if (Array.isArray(raw)) return raw.flatMap(v => parseValue(definition, v));
	switch (definition.type) {
		case 'boolean': {
			try {
				const result = z.union(
					[
						z.boolean(),
						z.literal('1').transform(() => true),
						z.literal('2').transform(() => false),
						z.null().transform(() => false)
					]).parse(raw);
				return result;
			} catch (e) {
				return false;
			}
		}
		case 'date':
			return z.union([
				z.iso.date().pipe(z.coerce.date()),
				z.date().nullable().default(new Date())
			]).parse(raw);
		case 'float':
		case 'number':
		case 'int': {
			try {
				return z.coerce.number().nullable().parse(raw ?? definition.default);
			} catch (e) {
				return defaultValueForType(definition.type) as number;
			}
		}
		case 'multi-selection':
			return raw?.split(' ') ?? []
		case "point": {
			if (!raw) return GeopointSchema.parse({});
			if (typeof raw == 'string') {
				const [lat, long] = raw?.split(' ', 2) ?? [];
				return GeopointSchema.parse({ lat, long });
			}
			return raw;
		}
		case 'text': {
			if (!raw) return defaultValueForType('text') as string;
			return String(raw);
		}
		case 'single-selection':
			return raw;
		default:
			return null;
	}
}
