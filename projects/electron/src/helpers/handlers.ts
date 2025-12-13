import {
	createChannelHandler,
	createPushHandler,
	deleteSubmission,
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
	getResourceUrl, getSubmissionInfo,
	initializeSubmissionVersioning,
	processSubmissionDataUpdate,
	removeFieldMapping,
	revertSubmissionVersion,
	toggleApprovalStatus,
	updateFieldMappings,
	updateLocale,
	updateTheme,
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
	createChannelHandler('submission:delete', async req => {
		return await deleteSubmission(req);
	})
	createChannelHandler('approval:toggle', async req => {
		return await toggleApprovalStatus(req);
	})
	createChannelHandler('facility-info:read', async (req) => {
		return await getSubmissionInfo(req);
	})
	createChannelHandler('build:read', () => {
		return getBuildInfo();
	})
	createChannelHandler('licences:read', () => {
		return getLicences();
	})
	createChannelHandler('db-conn:use', (req) => {
		return useConnection(req);
	})
	createChannelHandler('db-conn:clear', () => {
		return clearConnections();
	})
	createChannelHandler('db-conn:delete', req => {
		return removeConnection(req);
	})
	createChannelHandler('db-conn:add', (req) => {
		return saveConnectionParameters(req);
	});
	createChannelHandler('db-conns:read', () => {
		return findConnectionHistory();
	});
	createChannelHandler('migrations:apply', async () => {
		return await runMigrations();
	});
	createChannelHandler('migrations:check', async () => {
		return await checkMigration();
	});
	createChannelHandler('submission:revert', async arg => {
		return await revertSubmissionVersion(arg);
	});
	createChannelHandler('submission-version:init', async arg => {
		return await initializeSubmissionVersioning(arg);
	});
	createChannelHandler('submission-version:read', async arg => {
		return await findCurrentSubmissionVersion(arg);
	});
	createChannelHandler('submission-versions:read', async arg => {
		return await findSubmissionVersions(arg);
	});
	createChannelHandler('field-mapping:clear', async arg => {
		return await removeFieldMapping(arg);
	});
	createChannelHandler('submission-data:update', async arg => {
		return await processSubmissionDataUpdate(arg);
	})
	createChannelHandler('resource:read', (name) => {
		return getResourceUrl(name);
	})
	createChannelHandler('locale:update', ({ locale }) => {
		return updateLocale(locale);
	})
	createChannelHandler('theme:update', ({ theme }) => {
		return updateTheme(theme);
	})
	createChannelHandler('index-suggestions:read', async (args) => {
		return await findIndexSuggestions(args);
	});
	createChannelHandler('submission-ref:read', async (args) => {
		return await findSubmissionRef(args);
	});
	createChannelHandler('suggestions:read', async (dto) => {
		return await findAutocompleteSuggestions(dto);
	})
	createChannelHandler('submission-data:read', async (req: FindSubmissionDataRequest) => {
		return await findFormData(req);
	});
	createChannelHandler('field-mappings:update', async ({ form, updates }) => {
		return await updateFieldMappings(form, updates);
	});
	createChannelHandler('columns:read', async ({ form }) => {
		return await findDbColumns(form);
	});
	createChannelHandler('options:read', async ({ form }) => {
		return await findFormOptions(form);
	});
	createChannelHandler('translations:read', async ({ locale }) => {
		return findTranslationsFor(locale);
	});
	createChannelHandler('config:read', () => {
		return getAppConfig();
	});
	createChannelHandler('submissions:read', async ({
																										form,
																										page,
																										size,
																										filter
																									}) => {
		return await findFormSubmissions(form, page, size, filter);
	});
	createChannelHandler('config:update', ({ path, value }) => {
		storeValue(path as AppConfigPaths, value);
		return getAppConfig();
	});
	createChannelHandler('db:test', async (arg) => {
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
	createChannelHandler('field-mappings:read', async ({ form }) => {
		return await findFieldMappings(form);
	})
}
