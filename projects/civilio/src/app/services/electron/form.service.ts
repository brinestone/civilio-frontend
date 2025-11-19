import { Injectable } from '@angular/core';
import {
	createPaginatedResultSchema,
	FieldKey,
	FieldUpdateSpec,
	FindDbColumnsResponseSchema,
	FindFieldMappingsResponseSchema,
	FindFormOptionsResponseSchema,
	FindSubmissionCurrentVersionRequest,
	FindSubmissionCurrentVersionResponse, FindSubmissionDataRequest,
	FindSubmissionDataResponseSchema,
	FindSubmissionRefResponse, FindSubmissionRefSuggestionsRequest, FindSubmissionRefSuggestionsResponse,
	FindSubmissionVersionsRequest,
	FindSubmissionVersionsResponse,
	FormSubmissionSchema,
	FormSubmissionUpdateRequest,
	FormType,
	InitializeSubmissionVersionRequest,
	InitializeSubmissionVersionResponse,
	RemoveFieldMappingRequest,
	RemoveFieldMappingResponse,
	UpdateSubmissionSubFormDataRequest
} from '@civilio/shared';
import { sendRpcMessageAsync } from '@app/util';
import { FormService } from '../form';

@Injectable({
	providedIn: null
})
export class ElectronFormService implements FormService {
	async initializeSubmissionVersion(req: InitializeSubmissionVersionRequest): Promise<InitializeSubmissionVersionResponse> {
		return await sendRpcMessageAsync('submission-version:init', req);
	}

	async findCurrentSubmissionVersion(req: FindSubmissionCurrentVersionRequest): Promise<FindSubmissionCurrentVersionResponse> {
		return await sendRpcMessageAsync('submission-version:read', req);
	}

	async findSubmissionVersions(req: FindSubmissionVersionsRequest): Promise<FindSubmissionVersionsResponse> {
		return await sendRpcMessageAsync('submission-versions:read', req);
	}

	async removeMapping(req: RemoveFieldMappingRequest): Promise<RemoveFieldMappingResponse> {
		return await sendRpcMessageAsync('field-mapping:clear', req);
	}

	async updateSubFormSubmissionFormData(arg: UpdateSubmissionSubFormDataRequest) {
		return await sendRpcMessageAsync('submission-sub-data:update', arg);
	}

	async updateSubmissionFormData(arg: FormSubmissionUpdateRequest) {
		return await sendRpcMessageAsync('submission-data:update', arg);
	}

	async findIndexSuggestions(req: FindSubmissionRefSuggestionsRequest): Promise<FindSubmissionRefSuggestionsResponse> {
		return await sendRpcMessageAsync('index-suggestions:read', req);
	}

	async findSurroundingSubmissionRefs(form: FormType, index: number): Promise<FindSubmissionRefResponse> {
		return await sendRpcMessageAsync('submission-ref:read', { form, index });
	}

	async findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string) {
		return await sendRpcMessageAsync('suggestions:read', { field, query, resultSize: 10, form });
	}

	async findSubmissionData({ form, index, version }: FindSubmissionDataRequest) {
		return await sendRpcMessageAsync('submission-data:read', {
			form,
			index,
			version
		}).then(FindSubmissionDataResponseSchema.parse);
	}

	async updateFieldMappings(form: FormType, ...mappings: FieldUpdateSpec[]) {
		return await sendRpcMessageAsync('field-mappings:update', {
			form,
			updates: mappings
		});
	}

	async loadDbColumnSpecsFor(form: FormType) {
		return await sendRpcMessageAsync('columns:read', { form }).then(FindDbColumnsResponseSchema.parse);
	}

	async loadFormOptionsFor(form: FormType) {
		return await sendRpcMessageAsync('options:read', { form }).then(FindFormOptionsResponseSchema.parse);
	}

	async findFieldMappings(form: FormType) {
		return await sendRpcMessageAsync('field-mappings:read', {
			form
		}).then(FindFieldMappingsResponseSchema.parse);

	}

	async findFormSubmissions(form: FormType, page: number, size: number, filterQuery?: string) {
		const resultSchema = createPaginatedResultSchema(FormSubmissionSchema);
		return sendRpcMessageAsync('submissions:read', {
			form, page, size, filter: filterQuery
		}).then(resultSchema.parse);
	}
}
