import { Injectable, makeEnvironmentProviders } from "@angular/core";
import { FORM_SERVICE_IMPL, FormService } from "../form";
import {
	DeleteSubmissionRequest,
	FieldKey,
	FieldUpdateSpec,
	FindDbColumnsResponse,
	FindFieldMappingsRequest,
	FindFieldMappingsResponse,
	FindFormOptionsResponse,
	FindIndexSuggestionsRequest,
	FindIndexSuggestionsResponse,
	FindSubmissionCurrentVersionRequest,
	FindSubmissionCurrentVersionResponse,
	FindSubmissionDataRequest,
	FindSubmissionDataResponse,
	FindSubmissionRefRequest,
	FindSubmissionRefResponse,
	FindSubmissionVersionsRequest,
	FindSubmissionVersionsResponse,
	FormSubmission,
	FormType,
	GetAutoCompletionSuggestionsResponse,
	GetFacilityInfoRequest,
	GetFacilityInfoResponse,
	InitializeSubmissionVersionRequest,
	InitializeSubmissionVersionResponse,
	Paginated,
	RemoveFieldMappingRequest,
	RemoveFieldMappingResponse,
	ToggleApprovalStatusRequest,
	UpdateSubmissionRequest,
	UpdateSubmissionResponse,
	VersionRevertRequest,
	VersionRevertResponse
} from '@civilio/shared';

@Injectable({
	providedIn: null
})
export class WebFormService implements FormService {
	deleteSubmission(req: DeleteSubmissionRequest): Promise<void> {
		throw new Error("Method not implemented.");
	}

	toggleApprovalStatus(req: ToggleApprovalStatusRequest): Promise<void> {
		throw new Error("Method not implemented.");
	}

	getFacilityInfo(req: GetFacilityInfoRequest): Promise<GetFacilityInfoResponse> {
		throw new Error("Method not implemented.");
	}

	revertSubmissionVersion(req: VersionRevertRequest): Promise<VersionRevertResponse> {
		throw new Error("Method not implemented.");
	}

	updateFormSubmission(req: UpdateSubmissionRequest): Promise<UpdateSubmissionResponse> {
		throw new Error("Method not implemented.");
	}

	initializeSubmissionVersion(req: InitializeSubmissionVersionRequest): Promise<InitializeSubmissionVersionResponse> {
		throw new Error("Method not implemented.");
	}

	findCurrentSubmissionVersion(req: FindSubmissionCurrentVersionRequest): Promise<FindSubmissionCurrentVersionResponse> {
		throw new Error("Method not implemented.");
	}

	findSubmissionVersions(req: FindSubmissionVersionsRequest): Promise<FindSubmissionVersionsResponse> {
		throw new Error("Method not implemented.");
	}

	removeMapping(req: RemoveFieldMappingRequest): Promise<RemoveFieldMappingResponse> {
		throw new Error("Method not implemented.");
	}

	findSubmissionData(req: FindSubmissionDataRequest): Promise<FindSubmissionDataResponse> {
		throw new Error("Method not implemented.");
	}

	updateFieldMappings(form: FormType, ...mappings: FieldUpdateSpec[]): Promise<FindFieldMappingsResponse> {
		throw new Error("Method not implemented.");
	}

	loadDbColumnSpecsFor(form: FormType): Promise<FindDbColumnsResponse> {
		throw new Error("Method not implemented.");
	}

	loadFormOptionsFor(form: FormType): Promise<FindFormOptionsResponse> {
		throw new Error("Method not implemented.");
	}

	findFieldMappings(arg: FindFieldMappingsRequest): Promise<FindFieldMappingsResponse> {
		throw new Error("Method not implemented.");
	}

	findFormSubmissions(form: FormType, page: number, size: number, filter?: string): Promise<Paginated<FormSubmission>> {
		throw new Error("Method not implemented.");
	}

	findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string): Promise<GetAutoCompletionSuggestionsResponse> {
		throw new Error("Method not implemented.");
	}

	findSurroundingSubmissionRefs(req: FindSubmissionRefRequest): Promise<FindSubmissionRefResponse> {
		throw new Error("Method not implemented.");
	}

	findIndexSuggestions(req: FindIndexSuggestionsRequest): Promise<FindIndexSuggestionsResponse> {
		throw new Error("Method not implemented.");
	}

}

export function usingWeb() {
	return makeEnvironmentProviders([
		WebFormService,
		{
			provide: FORM_SERVICE_IMPL,
			useExisting: WebFormService
		}
	]);
}
