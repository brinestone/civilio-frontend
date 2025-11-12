import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { isDesktop } from "@app/util";
import {
	FieldKey,
	FieldUpdateSpec,
	FindDbColumnsResponse,
	FindFieldMappingsResponse,
	FindFormOptionsResponse, FindSubmissionCurrentVersionRequest, FindSubmissionCurrentVersionResponse,
	FindSubmissionDataRequest,
	FindSubmissionDataResponse,
	FindSubmissionRefResponse,
	FindSubmissionVersionsRequest, FindSubmissionVersionsResponse,
	FormSubmissionSchema,
	FormSubmissionUpdateRequest,
	FormType,
	GetAutoCompletionSuggestionsResponse,
	Paginated,
	RemoveFieldMappingRequest,
	RemoveFieldMappingResponse,
	UpdateSubmissionFormDataResponse,
	UpdateSubmissionSubFormDataRequest,
	UpdateSubmissionSubFormDataResponse
} from "@civilio/shared";
import { ElectronFormService } from "../electron/form.service";
import { WebFormService } from "../web/form.service";

export interface FormService {
	findCurrentSubmissionVersion(req: FindSubmissionCurrentVersionRequest): Promise<FindSubmissionCurrentVersionResponse>;
	findSubmissionVersions(req: FindSubmissionVersionsRequest): Promise<FindSubmissionVersionsResponse>;
	removeMapping(req: RemoveFieldMappingRequest): Promise<RemoveFieldMappingResponse>;
	updateSubFormSubmissionFormData(req: UpdateSubmissionSubFormDataRequest): Promise<UpdateSubmissionFormDataResponse>;
	updateSubmissionFormData(req: FormSubmissionUpdateRequest): Promise<UpdateSubmissionSubFormDataResponse>;
	findSubmissionData(req: FindSubmissionDataRequest): Promise<FindSubmissionDataResponse>;
	updateFieldMappings(form: FormType, ...mappings: FieldUpdateSpec[]): Promise<FindFieldMappingsResponse>;
	loadDbColumnSpecsFor(form: FormType): Promise<FindDbColumnsResponse>;
	loadFormOptionsFor(form: FormType): Promise<FindFormOptionsResponse>;
	findFieldMappings(form: FormType): Promise<FindFieldMappingsResponse>;
	findFormSubmissions(form: FormType, page: number, size: number, filter?: string): Promise<Paginated<typeof FormSubmissionSchema>>;
	findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string): Promise<GetAutoCompletionSuggestionsResponse>;
	findSurroundingSubmissionRefs(form: FormType, index: number): Promise<FindSubmissionRefResponse>;
	findIndexSuggestions(form: FormType, query: string): Promise<number[]>;
}

export const FORM_SERVICE = new InjectionToken<FormService>('Form Service');

export function provideDomainForms() {
	const providers: any = [
		{
			provide: FORM_SERVICE, useExisting: isDesktop() ? ElectronFormService : WebFormService
		}
	];
	if (isDesktop()) {
		providers.push({ provide: ElectronFormService, useClass: ElectronFormService });
	} else {
		providers.push({ provide: WebFormService, useClass: WebFormService });
	}
	return makeEnvironmentProviders(providers);
}
