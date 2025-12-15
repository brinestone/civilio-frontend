import { CanDeactivateFn } from '@angular/router';
import { HasPendingChanges } from '@app/model/form';
import { defaultIfEmpty, from, map } from 'rxjs';

export const hasChangesGuard: CanDeactivateFn<HasPendingChanges> = (component, currentRoute, currentState, nextState) => {
	const result = component.hasPendingChanges();
	if (typeof result == 'boolean') return !result;
	return from(result).pipe(
		map(v => !v),
		defaultIfEmpty(false)
	)
};
