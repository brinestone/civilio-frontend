import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { inject } from '@angular/core';
import { CONFIG_SERVICE } from '@app/services/config';
import { TranslateService } from '@ngx-translate/core';
import { CONFIG_STATE } from '@app/store/config';
import { toast } from 'ngx-sonner';

export const apiConfiguredGuard: (redirect: string) => CanActivateFn = (redirect: string) => {
	return async (_, state) => {
		const store = inject(Store);
		const router = inject(Router);
		const cs = inject(CONFIG_SERVICE);
		const ts = inject(TranslateService);
		const tree = router.createUrlTree([redirect], {
			queryParams: {
				'continue': encodeURIComponent(state.url)
			},
			queryParamsHandling: 'merge'
		});
		const { serverOnline } = store.selectSnapshot(CONFIG_STATE);
		if (!serverOnline) {
			try {
				await cs.discoverServer();
				return true;
			} catch (e) {
				toast.warning(ts.instant('misc.config_required.api'));
				return tree;
			}
		}
		return true;
	};
};
