import { z } from 'zod';

export const DbConnectionRefSchema = z.object({
	username: z.string(),
	database: z.string(),
	port: z.number(),
	host: z.string(),
	ssl: z.coerce.boolean(),
	inUse: z.coerce.boolean(),
	addedAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	migrated: z.coerce.boolean(),
	password: z.string().optional(),
	id: z.number()
});
export const DbConnectionRefInputSchema = DbConnectionRefSchema.omit({
	id: true,
	inUse: true,
	migrated: true,
	addedAt: true,
	updatedAt: true
}).extend({
	password: z.string()
})

export const MigrationFileSchema = z.object({
	name: z.string(),
	timestamp: z.number(),
	hash: z.string()
});

export const MigrationsCheckReportSchema = z.object({
	needsMigration: z.boolean(),
	pending: MigrationFileSchema.array().default([]),
	applied: z.string().array(),
	lastApplied: z.string().nullable()
});

export const SubmissionChangeDeltaSchema = z.object({
	op: z.enum(['add', 'update', 'delete']),
	field: z.string().optional(),
	index: z.union([z.string(), z.number()]).optional(),
	value: z.any().optional(),
	identifierKey: z.string().optional(),
})
const VersionChangeOpSchema = z.union([
	z.literal("INSERT"),
	z.literal("UPDATE"),
	z.literal("DELETE"),
	z.string() // Fallback if the enum has more values
]);
export const SubmissionVersionInfoSchema = z.object({
	changed_at: z.coerce.date(),
	operation: VersionChangeOpSchema,
	version: z.string(),
	parent_version: z.string().nullable(),
	changed_by: z.string().nullable(),
	is_current: z.boolean()
});
export const ThemeSchema = z.enum(['light', 'system', 'dark']);
export const LocaleSchema = z.enum(['en-CM', 'fr-CM']);
export const FormTypeSchema = z.enum(['csc', 'fosa', 'chefferie']);
export const DbColumnSpecSchema = z.object({
	name: z.string(),
	dataType: z.string(),
	tableName: z.string()
});
export const OptionSchema = z.object({
	label: z.string().nullable(),
	value: z.string().nullable(),
	parent: z.string().nullable(),
	i18nKey: z.string().nullable()
});

export function createPaginatedResultSchema<T extends z.ZodTypeAny>(schema: T) {
	return z.object({
		data: schema.array().default([]),
		totalRecords: z.number().default(0)
	})
}

export const FieldMappingSchema = z.object({
	field: z.string(),
	i18nKey: z.string().optional().nullable(),
	dbColumn: z.string(),
	dbTable: z.string(),
	form: FormTypeSchema,
	dbColumnType: z.string()
});

export const validationStatuses = z.enum(['validation_status_approved', 'validation_status_on_hold']);
export const FormSubmissionSchema = z.object({
	id: z.number(),
	index: z.number(),
	validationStatus: validationStatuses.optional().nullable(),
	validationCode: z.string(),
	facilityName: z.string().nullable(),
	submissionTime: z.coerce.date(),
	form: FormTypeSchema,
	isValid: z.boolean(),
	lastModifiedAt: z.coerce.date().nullable(),
	lastModifiedBy: z.string().nullable(),
	currentVersion: z.string().nullable(),
});
export const AppPrefsSchema = z.object({
	theme: ThemeSchema,
	locale: LocaleSchema,
	fontSize: z.number()
		.default(15)
});
export const DbConfigSchema = z.object({
	username: z.string(),
	password: z.string(),
	ssl: z.boolean().default(false),
	host: z.string(),
	port: z.number().default(5432),
	database: z.string()
});
export const AppConfigSchema = z.object({
	prefs: AppPrefsSchema.partial().optional(),
	misc: z.record(z.string(), z.unknown()).optional()
}).default({});

export const GeoPointSchema = z.object({
	lat: z.coerce.number().min(-90).max(90).default(5.483401),
	long: z.coerce.number().max(180).min(-180).default(47.88104)
})

export type AppPrefs = z.infer<typeof AppPrefsSchema>;
export type FieldMapping = z.infer<typeof FieldMappingSchema>;
export type GeoPoint = z.infer<typeof GeoPointSchema>;
export type FormType = z.infer<typeof FormTypeSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type FormSubmission = z.infer<typeof FormSubmissionSchema>;
export type Option = z.infer<typeof OptionSchema>;
export type ThemeMode = z.infer<typeof ThemeSchema>;
export type Locale = z.infer<typeof LocaleSchema>;
export type DbConfig = z.infer<typeof DbConfigSchema>;
export type DbColumnSpec = z.infer<typeof DbColumnSpecSchema>;
type FixArr<T> = T extends readonly any[] ? Omit<T, Exclude<keyof any[], number>> : T;
type DropInitDot<T> = T extends `.${ infer U }` ? U : T;
type _DeepKeys<T> = T extends object ? (
	{
		[K in (string | number) & keyof T]:
		`${ (
			`.${ K }` | (`${ K }` extends `${ number }` ? `[${ K }]` : never)
			) }${ "" | _DeepKeys<FixArr<T[K]>> }`
	}[
		(string | number) & keyof T]
	) : never;
type DeepKeys<T> = DropInitDot<_DeepKeys<FixArr<T>>>;
export type AppConfigPaths = DeepKeys<AppConfig>;
export type Paginated<T> = {
	totalRecords: number;
	data: T extends z.ZodType ? z.output<T>[] : T[];
}

type IsObject<T> = T extends object
	? T extends ReadonlyArray<any>
		? false
		: true
	: false;

export type SubmissionVersionInfo = z.output<typeof SubmissionVersionInfoSchema>;
export type SubmissionChangeDelta = z.output<typeof SubmissionChangeDeltaSchema>;
export type SubmissionChangeDeltaInput = z.input<typeof SubmissionChangeDeltaSchema>;
export type DbConnectionRef = z.output<typeof DbConnectionRefSchema>;
export type DbConnectionRefInput = z.input<typeof DbConnectionRefInputSchema>;
