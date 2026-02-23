import { inject, Injectable } from "@angular/core";
import { CivilioSdk, SdkRequestAdapter } from "@app/adapters/sdk";
import { FileUploadResponse } from "@civilio/sdk/models";
import { Strict } from "@civilio/shared";
import { MultipartBody } from "@microsoft/kiota-abstractions";

@Injectable({ providedIn: null })
export class UploadService {
	private readonly api = inject(CivilioSdk).client.api;
	private readonly adapter = inject(SdkRequestAdapter);

	async uploadFiles(files: FileList) {
		const multipart = new MultipartBody();

		for (const file of files) {
			const buffer = await file.arrayBuffer();
			multipart.addOrReplacePart('files', file.type, buffer, undefined, file.name);
		}
		const result = await this.api.upload.post(multipart);
		if (!result) throw new Error('no files uploaded');
		result.body!.files!.forEach(i => i.urlPath = `${this.adapter.baseUrl}${i.urlPath}`);
		return result.body!.files! as Strict<FileUploadResponse>['body']['files'];
	}
}
