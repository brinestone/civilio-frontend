import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { isSignedIn as isUserSignedIn } from "@app/store/selectors";
import { Store } from "@ngxs/store";

export const authGuard: (redirect: string) => CanActivateFn = redirect => {
	return (_, state) => {
		const store = inject(Store);
		const router = inject(Router);
		const r = router.createUrlTree([redirect], {
			queryParams: {
				'continue': encodeURIComponent(state.url)
			}
		});
		const signedIn = store.selectSnapshot(isUserSignedIn);
		return signedIn ? true : r;
	}
}
