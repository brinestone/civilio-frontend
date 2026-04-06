export type DeltaChangeEvent<T> = {
	path: (string | number)[];
	changeType: 'delete' | 'update' | 'add';
	newValue?: T;
	oldValue?: T;
}
