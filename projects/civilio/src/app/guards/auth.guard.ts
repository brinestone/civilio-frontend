import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/services/auth.service";

export const authGuard: (redirect: string) => CanActivateFn = redirect => {
	return (_, state) => {
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
