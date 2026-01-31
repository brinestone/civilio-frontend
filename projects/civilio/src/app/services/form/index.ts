import {
	EnvironmentProviders,
	forwardRef,
	inject,
	Injectable,
	InjectionToken,
	makeEnvironmentProviders
} from "@angular/core";
import { FormSchema } from "@app/model/form";
import { LookupRequestBuilderGetQueryParameters } from "@civilio/sdk/api/submissions/lookup";
import {
	DeleteOptionGroupByIdRequest,
	DeleteOptionGroupOptionByIdRequest,
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
} from "@civilio/shared";
import { SdkService } from "../sdk";

@Injectable({
	providedIn: null
})
export class FormService2 {
	private readonly sdk = inject(SdkService);

	private get client() {
		return this.sdk.client;
	}

	async findFormDefinition(slug: string, formVersion?: string) {
		return await this.client.api.forms.byForm(slug).definition.get({
			queryParameters: { version: formVersion }
		})
	}

	async findFormSubmissions(req: LookupRequestBuilderGetQueryParameters) {
		return await this.client.api.submissions.lookup.get({ queryParameters: req });
	}

	async lookupFormDefinitions() {
		return await this.client.api.forms.lookup.get();
	}
}

export interface FormService {
	deleteOptionGroupItemById(req: DeleteOptionGroupOptionByIdRequest): Promise<void>;

	deleteOptionGroupById(req: DeleteOptionGroupByIdRequest): Promise<void>;

	saveOptionGroups(req: UpdateFormOptionsDataSetRequest): Promise<void>;

	loadUngroupedFormOptions(): Promise<FindFormOptionGroupsResponse>;

	findAllForms(): Promise<FormSchema[]>;

	versionExists(req: VersionExistsRequest): Promise<VersionExistsResponse>;

	deleteSubmission(req: DeleteSubmissionRequest): Promise<void>;

	toggleApprovalStatus(req: ToggleApprovalStatusRequest): Promise<void>;

	getFacilityInfo(req: GetFacilityInfoRequest): Promise<GetFacilityInfoResponse>;

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

	findFormSubmissions(form: string, page: number, size: number, filter?: string): Promise<Paginated<FormSubmission>>;

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
		},
		{
			useClass: FormService2,
			provide: FormService2,
			multi: false
		},
	]);
}
