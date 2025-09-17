import { findFormSubmissions, getAppConfig, respondingInputChannelHandler, respondingNoInputChannelHandler } from "@civilio/handlers";
import { AppConfigSchema, FindFormSubmissionsRequestSchema, UpdateConfigRequestSchema } from "@civilio/shared";
import _ from 'lodash';

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
  })
}
