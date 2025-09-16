import { getAppConfig } from "@civilio/handlers";
import { AppConfigSchema, BadRequestError, Channel, computeReplyChannel, ExecutionError, InferOutput, RpcBaseSchema, rpcMessageSchema } from "@civilio/shared";
import { ipcMain } from "electron/main";
import { reportError } from './error';

export function registerIpcHandlers() {
  ipcMain.on('config:read' as Channel, (event, eventData) => {
    const replyChannel = computeReplyChannel('config:read');
    const dataSchema = rpcMessageSchema(AppConfigSchema);
    try {
      const { headers } = RpcBaseSchema.parse(eventData);
      const config = AppConfigSchema.parse(getAppConfig());
      event.sender.send(replyChannel, {
        headers: {
          ...headers,
          ts: new Date(),
        },
        body: config
      } as InferOutput<typeof dataSchema>)
    } catch (e) {
      reportError(event, new ExecutionError(e.message, 'field-mappings:read', e));
    }
  })
}
