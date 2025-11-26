import {
	EnvironmentProviders,
	forwardRef,
	InjectionToken,
	makeEnvironmentProviders
} from "@angular/core";
import {
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
	InitializeSubmissionVersionRequest,
	InitializeSubmissionVersionResponse,
	Paginated,
	RemoveFieldMappingRequest,
	RemoveFieldMappingResponse,
	UpdateSubmissionRequest,
	UpdateSubmissionResponse,
	VersionRevertRequest,
	VersionRevertResponse
} from "@civilio/shared";

export interface FormService {
	revertSubmissionVersion(req: VersionRevertRequest): Promise<VersionRevertResponse>;

	updateFormSubmission(req: UpdateSubmissionRequest): Promise<UpdateSubmissionResponse>;

	initializeSubmissionVersion(req: InitializeSubmissionVersionRequest): Promise<InitializeSubmissionVersionResponse>;

	findCurrentSubmissionVersion(req: FindSubmissionCurrentVersionRequest): Promise<FindSubmissionCurrentVersionResponse>;

	findSubmissionVersions(req: FindSubmissionVersionsRequest): Promise<FindSubmissionVersionsResponse>;

	removeMapping(req: RemoveFieldMappingRequest): Promise<RemoveFieldMappingResponse>;

	findSubmissionData(req: FindSubmissionDataRequest): Promise<FindSubmissionDataResponse>;

	updateFieldMappings(form: FormType, ...mappings: FieldUpdateSpec[]): Promise<FindFieldMappingsResponse>;

	loadDbColumnSpecsFor(form: FormType): Promise<FindDbColumnsResponse>;

	loadFormOptionsFor(form: FormType): Promise<FindFormOptionsResponse>;

	findFieldMappings(arg: FindFieldMappingsRequest): Promise<FindFieldMappingsResponse>;

	findFormSubmissions(form: FormType, page: number, size: number, filter?: string): Promise<Paginated<FormSubmission>>;

	findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string): Promise<GetAutoCompletionSuggestionsResponse>;

	findSurroundingSubmissionRefs(req: FindSubmissionRefRequest): Promise<FindSubmissionRefResponse>;

	findIndexSuggestions(req: FindIndexSuggestionsRequest): Promise<FindIndexSuggestionsResponse>;
}

export const FORM_SERVICE = new InjectionToken<FormService>('Form Service');
export const FORM_SERVICE_IMPL = new InjectionToken<FormService>('concrete form service');

export function provideDomainForms(...providers: EnvironmentProviders[]) {
	return makeEnvironmentProviders([
		...providers,
		{
			provide: FORM_SERVICE,
			useExisting: forwardRef(() => FORM_SERVICE_IMPL)
		}
	]);
}
