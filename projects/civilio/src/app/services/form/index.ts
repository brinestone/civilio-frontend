import { InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { isDesktop } from "@app/util";
import { FieldKey, FieldUpdateSpec, FindDbColumnsResponse, FindFieldMappingsResponse, FindFormOptionsResponse, FindSubmissionDataResponse, FindSubmissionRefResponse, FormSubmissionSchema, FormType, GetAutoCompletionSuggestionsResponse, Paginated, FormSubmissionUpdateRequest, UpdateSubmissionFormDataResponse, UpdateSubmissionSubFormDataRequest, UpdateSubmissionSubFormDataResponse, RemoveFieldMappingRequest, RemoveFieldMappingResponse } from "@civilio/shared";
import { ElectronFormService } from "../electron/form.service";
import { WebFormService } from "../web/form.service";

export interface FormService {
	removeMapping(req: RemoveFieldMappingRequest): Promise<RemoveFieldMappingResponse>;
	updateSubFormSubmissionFormData(req: UpdateSubmissionSubFormDataRequest): Promise<UpdateSubmissionFormDataResponse>;
	updateSubmissionFormData(req: FormSubmissionUpdateRequest): Promise<UpdateSubmissionSubFormDataResponse>;
	findSubmissionData(form: FormType, index: number): Promise<FindSubmissionDataResponse>;
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
