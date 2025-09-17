import { findFormSubmissions, getAppConfig, respondingInputChannelHandler, respondingNoInputChannelHandler } from "@civilio/handlers";
import { AppConfigSchema, FindFormSubmissionsRequestSchema, TestDbConnectionRequestSchema, UpdateConfigRequestSchema } from "@civilio/shared";
import _ from 'lodash';
import { testConnection } from "./db";

export function registerIpcHandlers() {
  respondingNoInputChannelHandler('config:read', () => {
    const v = getAppConfig();
    const config = AppConfigSchema.parse(v);
    return config;
  });
  respondingInputChannelHandler('submissions:read', FindFormSubmissionsRequestSchema, async ({ form, page, size, filter }) => {
    return await findFormSubmissions(form, page, size, filter);
  });
  respondingInputChannelHandler('config:update', UpdateConfigRequestSchema, ({ path, value }) => {
    const config = getAppConfig();
    _.set(config, path, value);
    config.save();
    return AppConfigSchema.parse(config);
  });
  respondingInputChannelHandler('db:test', TestDbConnectionRequestSchema, async (arg) => {
    return await testConnection(arg);
  });
}
