import { Observable } from 'rxjs';

export * from './models';
export * from './schemas';

export interface HasPendingChanges {
  hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean>;
}
