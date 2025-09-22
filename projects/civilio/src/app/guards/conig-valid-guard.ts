import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfigService } from '@app/services/config.service';
import { DbConfigSchema } from '@civilio/shared';
import { toast } from 'ngx-sonner';

export const dbConfiguredGuard: (redirect: string) => CanActivateFn = (redirect: string) => async (_, state) => {
  const store = inject(ConfigService);
  const config = await store.loadConfig()
  if (DbConfigSchema.safeParse(config.db).success) return true;
  const router = inject(Router);
  toast.warning('There is an issue with your database server settings. Please resolve it before proceeding');
  return router.createUrlTree([redirect], {
    queryParams: {
      'continue': encodeURIComponent(state.url)
    },
    queryParamsHandling: 'merge'
  });
};
