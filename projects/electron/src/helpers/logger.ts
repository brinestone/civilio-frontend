import { Channel } from "@civilio/shared";
import { provideLogger } from "./logging";
const logger = provideLogger('log-middleware');

export function logRequest(channel: Channel) {
	logger.info(`start: ${channel}`);
}

export function logResponse(channel: Channel | 'error') {
	// logger.info(`--> [${channel}]::${data.headers.messageId}`);
	logger.info(`end: ${channel}`);
}
