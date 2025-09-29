export * from './form/models';
export * from './form/schemas';

export interface HasPendingChanges {
  hasPendingChanges(): boolean;
}
