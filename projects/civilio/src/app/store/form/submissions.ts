import { Injectable, makeEnvironmentProviders } from "@angular/core";
import { SubmissionLookup } from "@civilio/sdk/models";
import Dexie, { EntityTable } from "dexie";

@Injectable({
	providedIn: null,
})
export class SubmissionsDatabase extends Dexie {
	constructor() {
		super('submissions-db');
		this.version(1).stores({
			submissions: '++index, form, formVersion, [index+form]'
		});
	}
	get submissions() {
		return this.table('submissions') as EntityTable<SubmissionLookup>;
	}
}

export function provideSubmissionsDatabase() {
	return makeEnvironmentProviders([
		SubmissionsDatabase
	]);
}
