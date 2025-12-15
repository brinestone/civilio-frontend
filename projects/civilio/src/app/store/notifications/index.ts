import { inject, Injectable } from '@angular/core';
import { NOTIFICATION_SERVICE } from '@app/services/notification';
import { State, StateContext, StateToken } from '@ngxs/store';

export * from './actions';

type NotificationStateModel = {
	externalServices: {
		name: string;
		isOnline: boolean;
		offlineReason?: string;
	}[];
}
type Context = StateContext<NotificationStateModel>;
const NOTIFICATION_STATE = new StateToken<NotificationStateModel>('notifications')

@State({
	name: NOTIFICATION_STATE,
	defaults: {
		externalServices: []
	}
})
@Injectable()
export class NotificationState {
	private ns = inject(NOTIFICATION_SERVICE);
	constructor() {
		this.ns.listen('service-status-update');
	}
}
