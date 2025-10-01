import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { PushEvent } from "@civilio/shared";
import { ElectronNotificationService } from "../electron/notification.service";

export interface NotificationService {
  listen(event: PushEvent): void;
}

export const NOTIFICATION_SERVICE = new InjectionToken('notification service');

export function provideNotifications() {
  return makeEnvironmentProviders([
    { provide: NOTIFICATION_SERVICE, useClass: ElectronNotificationService }
  ])
}
