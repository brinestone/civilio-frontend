import { z } from 'zod';

export interface ServiceEventPayload {
	service: string;
	status: 'Online' | 'Offline';
	details: any;
}

export const PrincipalSchema = z.object({
	displayName: z.string(),
	mail: z.email(),
	role: z.enum(['admin', 'maintainer', 'user']),
});

export const SubmissionInfoSchema = z.object({
	facilityName: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	coords: z.string().nullable().optional(),
	extraInfo: z.record(z.string(), z.unknown()).optional(),
	approved: z.boolean().optional(),
	createdAt: z.coerce.date().nullable()
});
export const BuildInfoSchema = z.object({
	author: z.object({
		name: z.string(),
		url: z.string().optional(),
		email: z.string().optional(),
	}),
	date: z.coerce.date(),
	contributors: z.object({
		name: z.string(),
		email: z.email().optional(),
		url: z.url().optional(),
		role: z.string().optional()
	}).array().default([]),
	description: z.string().optional(),
	displayName: z.string().optional(),
	license: z.string().optional(),
	version: z.string().optional(),
})

export const ThirdPartyLicenceSchema = z.object({
	package: z.string(),
	licenceType: z.string().optional(),
	licenceText: z.string().optional(),
	repository: z.string().optional(),
});
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
	is_current: z.boolean(),
	change_notes: z.string().nullable().optional()
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

export const validationStatuses = z.enum(['validation_status_approved', 'validation_status_on_hold', 'validation_status_not_approved']);
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
export const LdapConfigSchema = z.object({
	host: z.string(),
	tls: z.coerce.boolean(),
	baseDn: z.string()
});
export const AppConfigSchema = z.object({
	prefs: AppPrefsSchema.partial().optional(),
	misc: z.record(z.string(), z.unknown()).optional(),
	auth: LdapConfigSchema.optional()
}).default({});

export const GeoPointSchema = z.object({
	lat: z.coerce.number().min(-90).max(90).default(5.483401),
	long: z.coerce.number().max(180).min(-180).default(47.88104)
});
export const GeoPointInputSchema = z.string().nullable()
	.transform(s => {
		if (!s) return GeoPointSchema.parse({});
		const [lat, long] = s.split(' ', 3).slice(0, 2);
		return GeoPointSchema.parse({ lat, long });
	});

export type GeoPointInput = z.input<typeof GeoPointInputSchema>;
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
type DropInitDot<T> = T extends `.${infer U}` ? U : T;
type _DeepKeys<T> = T extends object ? (
	{
		[K in (string | number) & keyof T]:
		`${(
			`.${K}` | (`${K}` extends `${number}` ? `[${K}]` : never)
		)}${"" | _DeepKeys<FixArr<T[K]>>}`
	}[
	(string | number) & keyof T]
) : never;
type DeepKeys<T> = DropInitDot<_DeepKeys<FixArr<T>>>;
export type AppConfigPaths = DeepKeys<AppConfig>;
export type Paginated<T> = {
	totalRecords: number;
	data: T extends z.ZodType ? z.output<T>[] : T[];
}


export type SubmissionChangeDeltaInput = z.input<typeof SubmissionChangeDeltaSchema>;
export type DbConnectionRef = z.output<typeof DbConnectionRefSchema>;
export type DbConnectionRefInput = z.input<typeof DbConnectionRefInputSchema>;
export type ThirdPartyLicence = z.output<typeof ThirdPartyLicenceSchema>;
export type BuildInfo = z.output<typeof BuildInfoSchema>;
export type SubmissionVersionInfo = z.output<typeof SubmissionVersionInfoSchema>;
export type UserPrincipal = z.output<typeof PrincipalSchema>;
