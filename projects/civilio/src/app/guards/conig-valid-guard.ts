import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { isConfigValid } from '../state/selectors';

export const conigValidGuard: (redirect: string) => CanActivateFn = (redirect: string) => (route, state) => {
  const store = inject(Store);
  const isConfigured = store.selectSnapshot(isConfigValid);
  if (isConfigured) return true;
  const router = inject(Router);
  return router.createUrlTree([redirect], {
    queryParams: {
      'continue': encodeURIComponent(state.url)
    },
    queryParamsHandling: 'merge'
  });
};
