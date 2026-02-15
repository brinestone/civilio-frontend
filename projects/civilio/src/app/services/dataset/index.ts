import { inject, Injectable } from "@angular/core";
import { CivilioSdk } from "@app/adapters/sdk";
import { RefsPostRequestBody } from "@civilio/sdk/api/datasets/refs";
import { DeleteOptionGroupByIdRequest, DeleteOptionGroupOptionByIdRequest, UpdateFormOptionsDataSetRequest } from "@civilio/shared";

const refPrefix = 'refs:dataset::';
@Injectable({ providedIn: null })
export class DatasetService {
	private readonly api = inject(CivilioSdk).client.api.datasets;

	async getDatasetRefItems(arg: string) {
		let refId = arg.trim();
		if (refId.startsWith(refPrefix)) {
			refId = arg.substring(refPrefix.length);
		}

		const response = await this.api.refs.byRef(refId).items.get();
		if (response) {
			response.forEach(di => {
				di.value = `${arg}::${di.value}`;
			})
		}
		return response;
	}

	async createDatasetRef(arg: RefsPostRequestBody) {
		const result = await this.api.refs.post(arg);
		return `${refPrefix}${result?.ref}`;
	}

	async getDatasetItems(dataset: string, filter?: string, page?: number, size?: number) {
		return await this.api.byDataset(dataset)
			.items.get({
				queryParameters: {
					page, size, filter
				}
			});
	}

	async lookupDatasets(filter?: string, page?: number, size?: number) {
		return await this.api.lookup.get({
			queryParameters: {
				filter, page, size
			}
		})
	}

	async isKeyAvailable(key: string, datasetRef?: string) {
		const result = await this.api.keyAvailable.get({ queryParameters: { key, ref: datasetRef } });
		return result?.available ?? false;
	}

	async findDatasets() {
		return (await this.api.get()) ?? [];
	}

	async deleteDatasetItem(req: DeleteOptionGroupOptionByIdRequest) {
		return await this.api.byDataset(req.dataset).byItem(req.itemId).delete();
	}

	async deleteDataset(req: DeleteOptionGroupByIdRequest) {
		return await this.api.byDataset(req.id).delete();
	}

	async saveDatasets(req: UpdateFormOptionsDataSetRequest) {
		return await this.api.post(req as any);
	}
}
