import { createChannelHandler, createPushHandler, findAutocompleteSuggestions, findDbColumns, findFieldMappings, findFormData, findFormOptions, findFormSubmissions, findIndexSuggestions, findSubmissionRef, findTranslationsFor, getAppConfig, getResourceUrl, updateFieldMappings, processChangeRequest, updateTheme, watchAssets } from "@civilio/handlers";
import { AppConfigPaths } from "@civilio/shared";
import { testConnection } from "./db";
import { storeValue } from "./store";

export function registerDevelopmentIpcHandlers() {
  createPushHandler('i18n:update', watchAssets);
}

export function registerProductionIpcHandlers() {
  createChannelHandler('submission-data:update', async arg => {
    return await processChangeRequest(arg);
  })
  createChannelHandler('resource:read', (name) => {
    return getResourceUrl(name);
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
  createChannelHandler('submission-data:read', async ({ form, index }) => {
    return await findFormData(form, index);
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
    const config = getAppConfig();
    return config;
  });
  createChannelHandler('submissions:read', async ({ form, page, size, filter }) => {
    return await findFormSubmissions(form, page, size, filter);
  });
  createChannelHandler('config:update', ({ path, value }) => {
    storeValue(path as AppConfigPaths, value);
    return getAppConfig();
  });
  createChannelHandler('db:test', async (arg) => {
    return await testConnection(arg);
  });
  createChannelHandler('field-mappings:read', async ({ form }) => {
    return await findFieldMappings(form);
  })
}
