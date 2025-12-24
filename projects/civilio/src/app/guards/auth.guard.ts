import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/services/auth.service";
import { Store } from "@ngxs/store";

export const authGuard: (redirect: string) => CanActivateFn = redirect => {
	return (_, state) => {
		const store = inject(Store);
		const router = inject(Router);
		const authService = inject(AuthService);
		const r = router.createUrlTree([redirect], {
			queryParams: {
				'continue': encodeURIComponent(state.url)
			}
		});

		const signedIn = authService.isAuthed();
		return signedIn ? true : r;
	}
}
