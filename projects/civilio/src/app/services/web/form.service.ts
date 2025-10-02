import { Injectable } from "@angular/core";
import { FormType, FindSubmissionDataResponse, FieldUpdateSpec, FindFieldMappingsResponse, FindDbColumnsResponse, FindFormOptionsResponse, Paginated, FormSubmissionSchema, FieldKey, GetAutoCompletionSuggestionsResponse, FindSubmissionRefResponse } from "@civilio/shared";
import { FormService } from "../form";

@Injectable({
  providedIn: null
})
export class WebFormService implements FormService {
  findIndexSuggestions(form: FormType, query: string): Promise<number[]> {
    throw new Error("Method not implemented.");
  }
  findSurroundingSubmissionRefs(form: FormType, index: number): Promise<FindSubmissionRefResponse> {
    throw new Error("Method not implemented.");
  }
  findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string): Promise<GetAutoCompletionSuggestionsResponse> {
    throw new Error("Method not implemented.");
  }

  findSubmissionData(form: FormType, index: number): Promise<FindSubmissionDataResponse> {
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
