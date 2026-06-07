import { PushDocumentChange, PushDocumentChanges200Output } from "@civilio/sdk/models";
import { SyncStateModel } from ".";

const prefix = '[sync]';

export class PushDocumentChanges {
	static type = `${prefix} Push Document changes`;
	constructor(readonly changes: PushDocumentChange[]) { }
}

export class RecordLocalChanges {
	static type = `${prefix} Record Local Document Changes`
	constructor(readonly changes: PushDocumentChanges200Output['changes']) { }
}

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
	constructor(readonly key: keyof SyncStateModel, readonly value: string) {
	}
}

export class ObserveCollections {
	static type = `${prefix} Observe Collections`;
}
