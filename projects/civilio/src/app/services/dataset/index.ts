import { inject, Injectable } from "@angular/core";
import { CivilioSdk } from "@app/adapters/sdk";
import { DeleteOptionGroupByIdRequest, DeleteOptionGroupOptionByIdRequest, UpdateFormOptionsDataSetRequest } from "@civilio/shared";

@Injectable({ providedIn: null })
export class DatasetService {
	private readonly sdk = inject(CivilioSdk).client;

	async isKeyAvailable(key: string, datasetRef?: string) {
		const result = await this.sdk.api.datasets.keyAvailable.get({ queryParameters: { key, ref: datasetRef } });
		return result?.available ?? false;
	}

	async findDatasets() {
		return (await this.sdk.api.datasets.get()) ?? [];
	}

	async deleteDatasetItem(req: DeleteOptionGroupOptionByIdRequest) {
		return await this.sdk.api.datasets.byDataset(req.dataset).byItem(req.itemId).delete();
	}

	async deleteDataset(req: DeleteOptionGroupByIdRequest) {
		return await this.sdk.api.datasets.byDataset(req.id).delete();
	}

	async saveDatasets(req: UpdateFormOptionsDataSetRequest) {
		return await this.sdk.api.datasets.post(req as any);
	}
}
