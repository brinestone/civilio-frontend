import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CONFIG_SERVICE } from '@app/services/config';
import { toast } from 'ngx-sonner';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CONFIG_STATE } from '@app/store/config';

export const dbConfiguredGuard: (redirect: string) => CanActivateFn = (redirect: string) => {
	return async (_, state) => {
		console.log('from guard');
		const store = inject(Store);
		const cs = inject(CONFIG_SERVICE);
		const router = inject(Router);
		const ts = inject(TranslateService);
		const tree = router.createUrlTree([redirect], {
			queryParams: {
				'continue': encodeURIComponent(state.url)
			},
			queryParamsHandling: 'merge'
		});
		try {
			const {
				connectionsLoaded,
				knownConnections
			} = store.selectSnapshot(CONFIG_STATE);
			if (!connectionsLoaded) {
				const connections = await cs.findConnectionHistory();
				if (connections.some(c => c.inUse)) {
					return true;
				} else {
					return tree;
				}
			} else {
				if (knownConnections.some(c => c.inUse)) {
					return true;
				} else {
					toast.warning(ts.instant('misc.config_required.notice'));
					return tree;
				}
			}
		} catch (e) {
			toast.warning(ts.instant('misc.config_required.notice'));
			return tree;
		}
	};
};
