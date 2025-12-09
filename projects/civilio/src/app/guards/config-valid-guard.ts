import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Store } from '@ngxs/store';
import { CONFIG_STATE } from '@app/store/config';
import { map, skipWhile } from 'rxjs';

export const dbConfiguredGuard: (redirect: string) => CanActivateFn = (redirect: string) => (_, state) => {
	const store = inject(Store);
	const router = inject(Router);
	const s = store.select(CONFIG_STATE);
	return s.pipe(
		skipWhile(({ preInit }) => preInit),
		map(({ knownConnections }) => {
			if (knownConnections.length > 0) return true;
			toast.warning('There is an issue with your database server settings. Please resolve it before proceeding');
			return router.createUrlTree([redirect], {
				queryParams: {
					'continue': encodeURIComponent(state.url)
				},
				queryParamsHandling: 'merge'
			});
		})
	);
};
