import { Injectable } from "@angular/core";
import { FieldKey, FieldUpdateSpec, FindDbColumnsResponse, FindFieldMappingsResponse, FindFormOptionsResponse, FindSubmissionDataResponse, FindSubmissionRefResponse, FormSubmissionSchema, FormType, GetAutoCompletionSuggestionsResponse, Paginated, FormSubmissionUpdateRequest, UpdateSubmissionFormDataResponse, UpdateSubmissionSubFormDataRequest, UpdateSubmissionSubFormDataResponse, RemoveFieldMappingRequest, RemoveFieldMappingResponse, FindSubmissionVersionsRequest, FindSubmissionVersionsResponse, FindSubmissionCurrentVersionRequest, FindSubmissionCurrentVersionResponse, FindSubmissionDataRequest } from "@civilio/shared";
import { FormService } from "../form";

@Injectable({
	providedIn: null
})
export class WebFormService implements FormService {
    findSubmissionData(req: FindSubmissionDataRequest): Promise<FindSubmissionDataResponse> {
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
	updateSubFormSubmissionFormData(req: UpdateSubmissionSubFormDataRequest): Promise<UpdateSubmissionFormDataResponse> {
		throw new Error("Method not implemented.");
	}
	updateSubmissionFormData(req: FormSubmissionUpdateRequest): Promise<UpdateSubmissionSubFormDataResponse> {
		throw new Error("Method not implemented.");
	}

  findIndexSuggestions(form: FormType, query: string): Promise<number[]> {
    throw new Error("Method not implemented.");
  }
  findSurroundingSubmissionRefs(form: FormType, index: number): Promise<FindSubmissionRefResponse> {
    throw new Error("Method not implemented.");
  }
  findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string): Promise<GetAutoCompletionSuggestionsResponse> {
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
  findFieldMappings(form: FormType): Promise<FindFieldMappingsResponse> {
    throw new Error("Method not implemented.");
  }
  findFormSubmissions(form: FormType, page: number, size: number, filter?: string): Promise<Paginated<typeof FormSubmissionSchema>> {
    throw new Error("Method not implemented.");
  }

}
