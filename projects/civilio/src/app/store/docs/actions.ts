import { SyncStateModel } from ".";

const prefix = '[sync]';

export class PullChanges {
	static type = `${prefix} Pull Document Changes`
}

export class GetEntity {
	static type = `${prefix} Get Entity`;
	constructor(readonly collection: keyof SyncStateModel, readonly key: string) {
	}
}

export class UpdateSyncState {
	static type = `${prefix} Update Sync State`;
	constructor(readonly key: keyof SyncStateModel, readonly value: number) {
	}
}

export class ObserveCollections {
	static type = `${prefix} Observe Collections`;
}
