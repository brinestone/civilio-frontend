import { Channel, RpcInputHeaders } from "@civilio/shared";
import { provideLogger } from "./logging";
const logger = provideLogger('log-middleware');

export function logRequest(channel: Channel, data: { headers: RpcInputHeaders }) {
	// logger.info(`<-- [${channel}]::${data.headers.messageId}`);
	// logger.info('<--', 'channel', channel, 'messageId', data.headers.messageId)
	logger.info(`start: ${channel}::${data.headers.messageId}`);
}

export function logResponse(channel: Channel | 'error', data: { headers: RpcInputHeaders }) {
	// logger.info(`--> [${channel}]::${data.headers.messageId}`);
	logger.info(`end: ${channel}::${data.headers.messageId}`);
}
