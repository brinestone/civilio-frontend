import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AppAction } from "@app/adapters/casl";
import { PureAbility, Subject } from "@casl/ability";
import { AbilityServiceSignal } from '@casl/angular';

export const permissionGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	const ab = inject<AbilityServiceSignal<PureAbility>>(AbilityServiceSignal);
	const r = router.createUrlTree(['/forbidden']);

	const permissions = route.data["permissions"] as [AppAction, Subject][];
	if (!permissions) return true;

	// debugger;
	let allowed = true;
	for (const [action, subject] of permissions) {
		allowed = allowed && ab.can(action, subject);
		if (!allowed) break;
	}

	return allowed ? true : r;
}
