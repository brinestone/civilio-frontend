import { inject, Injectable } from '@angular/core';
import { I18NUpdated } from '@app/store/notifications/actions';
import { PushEvent } from '@civilio/shared';
import { Store } from '@ngxs/store';
import { NotificationService } from '../notification';


@Injectable({
	providedIn: null
})
export class ElectronNotificationService implements NotificationService {
	private store = inject(Store);
	listen(event: PushEvent) {
		window.electron.on('push-notifications', (data) => {
			console.log(data);
			if (event == 'i18n:update') {
				this.store.dispatch(I18NUpdated);
			}
		});
	}
}
