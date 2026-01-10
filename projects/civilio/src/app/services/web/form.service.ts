import { Injectable, makeEnvironmentProviders } from "@angular/core";
import { FormSchema } from "@app/model/form";
import {
	DeleteSubmissionRequest,
	FieldKey,
	FieldUpdateSpec,
	FindDbColumnsResponse,
	FindFieldMappingsRequest,
	FindFieldMappingsResponse,
	FindFormOptionGroupsResponse,
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
	LoadAllFormOptionsRequest,
	Paginated,
	RemoveFieldMappingRequest,
	RemoveFieldMappingResponse,
	ToggleApprovalStatusRequest,
	UpdateFormOptionsDataSetRequest,
	UpdateSubmissionRequest,
	UpdateSubmissionResponse,
	VersionExistsRequest,
	VersionExistsResponse,
	VersionRevertRequest,
	VersionRevertResponse
} from '@civilio/shared';
import { FORM_SERVICE_IMPL, FormService } from "../form";

@Injectable({
	providedIn: null
})
export class WebFormService implements FormService {
	saveOptionGroups(req: UpdateFormOptionsDataSetRequest): Promise<void> {
		throw new Error("Method not implemented.");
	}
	loadUngroupedFormOptions(): Promise<FindFormOptionGroupsResponse> {
		throw new Error("Method not implemented.");
	}

	findAllForms(): Promise<FormSchema[]> {
		throw new Error("Method not implemented.");
	}

	versionExists(req: VersionExistsRequest): Promise<VersionExistsResponse> {
		throw new Error("Method not implemented.");
	}

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
