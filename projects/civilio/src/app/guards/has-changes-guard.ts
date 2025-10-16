import { CanDeactivateFn } from '@angular/router';
import { HasPendingChanges } from '@app/model/form';

export const hasChangesGuard: CanDeactivateFn<HasPendingChanges> = (component, currentRoute, currentState, nextState) => {
  const result = component.hasPendingChanges();
  return result;
};
