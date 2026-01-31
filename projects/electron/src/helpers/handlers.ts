import {
	createInvokeChannelHandler,
	createPushHandler,
	deleteSubmission,
	discoverServer,
	findAllFormOptions,
	findAutocompleteSuggestions,
	findCurrentSubmissionVersion,
	findDbColumns,
	findFieldMappings,
	findFormData,
	findFormOptions,
	findFormSubmissions,
	findIndexSuggestions,
	findSubmissionRef,
	findSubmissionVersions,
	findTranslationsFor,
	getAppConfig,
	getBuildInfo,
	getLicences,
	getResourceUrl,
	getSubmissionInfo,
	initializeSubmissionVersioning,
	processSubmissionDataUpdate,
	removeFieldMapping,
	revertSubmissionVersion,
	toggleApprovalStatus,
	updateFieldMappings,
	updateLocale,
	updateTheme,
	versionExists,
	watchAssets
} from "@civilio/handlers";
import { AppConfigPaths, FindSubmissionDataRequest } from "@civilio/shared";
import {
	checkMigration,
	clearConnections,
	findConnectionHistory,
	removeConnection,
	resetPool,
	runMigrations,
	saveConnectionParameters,
	testConnection,
	useConnection
} from "./db";
import { storeValue } from "./store";

export function registerDevelopmentIpcHandlers() {
	createPushHandler('i18n:update', watchAssets);
}

export function registerProductionIpcHandlers() {
	createInvokeChannelHandler('discovery:init', async () => {
		return await discoverServer();
	})
	createInvokeChannelHandler('options-raw:read', async (req) => {
		return await findAllFormOptions(req)
	})
	createInvokeChannelHandler('submission-version:exists', async req => {
		return await versionExists(req);
	})
	createInvokeChannelHandler('submission:delete', async req => {
		return await deleteSubmission(req);
	})
	createInvokeChannelHandler('approval:toggle', async req => {
		return await toggleApprovalStatus(req);
	})
	createInvokeChannelHandler('facility-info:read', async (req) => {
		return await getSubmissionInfo(req);
	})
	createInvokeChannelHandler('build:read', () => {
		return getBuildInfo();
	})
	createInvokeChannelHandler('licences:read', () => {
		return getLicences();
	})
	createInvokeChannelHandler('db-conn:use', (req) => {
		return useConnection(req);
	})
	createInvokeChannelHandler('db-conn:clear', () => {
		return clearConnections();
	})
	createInvokeChannelHandler('db-conn:delete', req => {
		return removeConnection(req);
	})
	createInvokeChannelHandler('db-conn:add', (req) => {
		return saveConnectionParameters(req);
	});
	createInvokeChannelHandler('db-conns:read', () => {
		return findConnectionHistory();
	});
	createInvokeChannelHandler('migrations:apply', async () => {
		return await runMigrations();
	});
	createInvokeChannelHandler('migrations:check', async () => {
		return await checkMigration();
	});
	createInvokeChannelHandler('submission:revert', async arg => {
		return await revertSubmissionVersion(arg);
	});
	createInvokeChannelHandler('submission-version:init', async arg => {
		return await initializeSubmissionVersioning(arg);
	});
	createInvokeChannelHandler('submission-version:read', async arg => {
		return await findCurrentSubmissionVersion(arg);
	});
	createInvokeChannelHandler('submission-versions:read', async arg => {
		return await findSubmissionVersions(arg);
	});
	createInvokeChannelHandler('field-mapping:clear', async arg => {
		return await removeFieldMapping(arg);
	});
	createInvokeChannelHandler('submission-data:update', async arg => {
		return await processSubmissionDataUpdate(arg);
	})
	createInvokeChannelHandler('resource:read', (name) => {
		return getResourceUrl(name);
	})
	createInvokeChannelHandler('locale:update', ({ locale }) => {
		return updateLocale(locale);
	})
	createInvokeChannelHandler('theme:update', ({ theme }) => {
		return updateTheme(theme);
	})
	createInvokeChannelHandler('index-suggestions:read', async (args) => {
		return await findIndexSuggestions(args);
	});
	createInvokeChannelHandler('submission-ref:read', async (args) => {
		return await findSubmissionRef(args);
	});
	createInvokeChannelHandler('suggestions:read', async (dto) => {
		return await findAutocompleteSuggestions(dto);
	})
	createInvokeChannelHandler('submission-data:read', async (req: FindSubmissionDataRequest) => {
		return await findFormData(req);
	});
	createInvokeChannelHandler('field-mappings:update', async ({ form, updates }) => {
		return await updateFieldMappings(form, updates);
	});
	createInvokeChannelHandler('columns:read', async ({ form }) => {
		return await findDbColumns(form);
	});
	createInvokeChannelHandler('options:read', async ({ form }) => {
		return await findFormOptions(form);
	});
	createInvokeChannelHandler('translations:read', async ({ locale }) => {
		return findTranslationsFor(locale);
	});
	createInvokeChannelHandler('config:read', () => {
		return getAppConfig();
	});
	createInvokeChannelHandler('submissions:read', async ({
																										form,
																										page,
																										size,
																										filter
																									}) => {
		return await findFormSubmissions(form, page, size, filter);
	});
	createInvokeChannelHandler('config:update', ({ path, value }) => {
		storeValue(path as AppConfigPaths, value);
		return getAppConfig();
	});
	createInvokeChannelHandler('db:test', async (arg) => {
		const result = await testConnection(arg);
		saveConnectionParameters({
			database: arg.database,
			host: arg.host,
			password: arg.password,
			port: Number(arg.port),
			ssl: Boolean(arg.ssl),
			username: arg.username
		});
		if (result) {
			resetPool();
		}
		return result
	});
	createInvokeChannelHandler('field-mappings:read', async ({ form }) => {
		return await findFieldMappings(form);
	})
}
