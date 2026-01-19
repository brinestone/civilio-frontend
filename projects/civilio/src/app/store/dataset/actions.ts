const prefix = '[dataset]';
export class LoadDatasets {
	static type = `${prefix} load datasets`;
}

export class DeleteDataset {
	static type = `${prefix} delete dataset`;
	constructor(readonly id: string) { }
}

export class SaveDatasets {
	static type = `${prefix} save datasets`;
	constructor(readonly payload: any){}
}
