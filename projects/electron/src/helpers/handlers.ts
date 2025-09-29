import { findDbColumns, findFieldMappings, findFormData, findFormOptions, findFormSubmissions, findTranslationsFor, getAppConfig, respondingInputChannelHandler, respondingNoInputChannelHandler, updateFieldMappings } from "@civilio/handlers";
import { AppConfigPaths, FindDbColumnsRequestSchema, FindFieldMappingsRequestSchema, FindFormOptionsRequestSchema, FindFormSubmissionsRequestSchema, FindSubmissionDataRequestSchema, LoadTranslationRequestSchema, TestDbConnectionRequestSchema, UpdateConfigRequestSchema, UpdateFieldMappingRequestSchema } from "@civilio/shared";
import { testConnection } from "./db";
import { storeValue } from "./store";

export function registerIpcHandlers() {
  respondingInputChannelHandler('submission-data:read', FindSubmissionDataRequestSchema, async ({ form, index }) => {
    return await findFormData(form, index);
  });
  respondingInputChannelHandler('field-mappings:update', UpdateFieldMappingRequestSchema, async ({ form, updates }) => {
    return await updateFieldMappings(form, updates);
  });
  respondingInputChannelHandler('columns:read', FindDbColumnsRequestSchema, async ({ form }) => {
    return await findDbColumns(form);
  });
  respondingInputChannelHandler('options:read', FindFormOptionsRequestSchema, async ({ form }) => {
    return await findFormOptions(form);
  });
  respondingInputChannelHandler('translations:read', LoadTranslationRequestSchema, async ({ locale }) => {
    return findTranslationsFor(locale);
  });
  respondingNoInputChannelHandler('config:read', () => {
    const config = getAppConfig();
    return config;
  });
  respondingInputChannelHandler('submissions:read', FindFormSubmissionsRequestSchema, async ({ form, page, size, filter }) => {
    return await findFormSubmissions(form, page, size, filter);
  });
  respondingInputChannelHandler('config:update', UpdateConfigRequestSchema, ({ path, value }) => {
    storeValue(path as AppConfigPaths, value);
    return getAppConfig();
  });
  respondingInputChannelHandler('db:test', TestDbConnectionRequestSchema, async (arg) => {
    return await testConnection(arg);
  });
  respondingInputChannelHandler('field-mappings:read', FindFieldMappingsRequestSchema, async ({ form }) => {
    return await findFieldMappings(form);
  })
}
