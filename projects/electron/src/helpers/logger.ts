import { Channel, RpcInputHeaders } from "@civilio/shared";

// const options = {
//   transports: [
//     new transports.File({
//       dirname: app.getPath('logs'),
//       filename: 'access.log',
//       level: 'info',
//       format: format.combine(
//         format.timestamp(),
//         format.label({ label: '[CIVILIO]', message: true }),
//         format.simple(),
//         format.errors()
//       )
//     }),
//   ]
// } as LoggerOptions;

// let logger: Logger;

// function assertLogger() {
//   if (!logger) {
//     if (!app.isPackaged && Array.isArray(options.transports)) {
//       options.transports.push(new transports.Console({
//         level: 'silly',
//         format: format.combine(
//           format.label({ label: '[CIVILIO]', message: true }),
//           format.simple(),
//           format.errors(),
//           format.cli(),
//           format.colorize()
//         )
//       }))
//     }
//     logger = new Logger(options);
//   }
//   return logger;
// }

export function logRequest(channel: Channel, data: { headers: RpcInputHeaders }) {
  console.log(`<-- ${data.headers.ts} [${channel}]::${data.headers.messageId}`);
}

export function logResponse(channel: Channel | 'error', data: { headers: RpcInputHeaders }) {
  console.log(`--> ${data.headers.ts} [${channel}]::${data.headers.messageId}`);
}
