import { AppError, Channel, ErrorCode, ErrorData } from "@civilio/shared";

const prefix = '[notification]'
export class NotificationReceived {
  static type = `${prefix} notification received`;
  constructor(readonly channel: Channel, readonly data?: unknown) { }
}

export class ErrorReceived implements Omit<AppError, 'messageId'> {
  static type = `${prefix} error received`;
  constructor(readonly code: ErrorCode, readonly data?: ErrorData, readonly srcChannel?: Channel, readonly message?: string) { }
}
