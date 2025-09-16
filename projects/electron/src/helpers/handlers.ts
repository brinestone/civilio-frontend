import { findFormSubmissions, getAppConfig, respondingInputChannelHandler, respondingNoInputChannelHandler } from "@civilio/handlers";
import { AppConfigSchema, FindFormSubmissionsRequestSchema } from "@civilio/shared";

export function registerIpcHandlers() {
  respondingNoInputChannelHandler('submissions:read', () => {
    const config = AppConfigSchema.parse(getAppConfig());
    return config;
  });
  respondingInputChannelHandler('submissions:read', FindFormSubmissionsRequestSchema, async ({form, page, size, filter})=> {
    return await findFormSubmissions(form, page, size, filter);
  })
}
