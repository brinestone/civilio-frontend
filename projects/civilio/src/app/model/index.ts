import { Observable } from 'rxjs';

export * from './form/models';
export * from './form/schemas';

export interface HasPendingChanges {
  hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean>;
}
