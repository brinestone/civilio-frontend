import { app } from 'electron';
import log from 'electron-log/main';
import { join } from 'path';

log.initialize({
	includeFutureSessions: false
});

export function provideLogger(service: string, useFileTransports = true) {
	const logger = log.create({ logId: service });
	if (!useFileTransports) logger.transports.file.level = false;
	else {
		logger.transports.file.resolvePathFn = () => join(app.getPath('logs'), `${service}.log`);
		logger.transports.file.level = app.isPackaged ? 'info' : false;
	}

	logger.transports.console.level = app.isPackaged ? 'info' : 'silly';
	logger.transports.console.useStyles = true;

	// Either don't set format at all for default colored output
	// logger.transports.console.format = undefined;

	logger.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}]{scope} {text}';
	// Remove the custom format entirely for colors to work
	// logger.transports.console.format = undefined;
	logger.transports.console.useStyles = true;

	return logger;
}
