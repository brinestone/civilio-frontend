import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { FormsService } from "../services/forms/forms.service";
import { SubmissionsService } from "../services/submissions/submissions.service";
import { DatasetsService } from "../services/datasets/datasets.service";

/**
 * Creates Angular environment providers for the Forms SDK.
 *
 * @returns {EnvironmentProviders} Environment providers array containing the FormsService configuration.
 *
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [withFormsSdk()]
 * });
 * ```
 */
export function withFormsSdk(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: FormsService, multi: false }]);
}
export const provideFormsSdk = withFormsSdk;

export function withSubmissionsSdk(): EnvironmentProviders {
	return makeEnvironmentProviders([
		{ provide: SubmissionsService, multi: false },
	]);
}

export const provideSubmissionsSdk = withSubmissionsSdk;

export function withDatasetSdk(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: DatasetsService, multi: false }]);
}

export const provideDatasetSdk = withDatasetSdk;
