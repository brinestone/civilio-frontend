import { Injectable, makeEnvironmentProviders } from '@angular/core';
import {
	ChefferieFormDefinition,
	CscFormDefinition,
	FosaFormDefinition
} from '@app/model/form';
import { sendRpcMessageAsync } from '@app/util';
import {
	createPaginatedResultSchema,
	DeleteOptionGroupByIdRequest,
	DeleteOptionGroupOptionByIdRequest,
	DeleteSubmissionRequest,
	FieldKey,
	FieldUpdateSpec,
	FindDbColumnsResponseSchema,
	FindFieldMappingsRequest,
	FindFieldMappingsResponseSchema,
	FindFormOptionGroupsResponse,
	FindFormOptionGroupsResponseSchema,
	FindFormOptionsResponseSchema,
	FindIndexSuggestionsRequest,
	FindIndexSuggestionsResponse,
	FindSubmissionCurrentVersionRequest,
	FindSubmissionCurrentVersionResponse,
	FindSubmissionDataRequest,
	FindSubmissionDataResponseSchema,
	FindSubmissionRefRequest,
	FindSubmissionRefResponse,
	FindSubmissionVersionsRequest,
	FindSubmissionVersionsResponse,
	FormSubmissionSchema,
	FormType,
	GetFacilityInfoRequest,
	GetFacilityInfoResponse,
	InitializeSubmissionVersionRequest,
	InitializeSubmissionVersionResponse,
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
import { FORM_SERVICE_IMPL, FormService } from '../form';
import { omit } from 'lodash';

@Injectable({
	providedIn: null
})
export class ElectronFormService implements FormService {
	async deleteOptionGroupItemById(req: DeleteOptionGroupOptionByIdRequest) {
		const response = await fetch(`${this.baseApiUrl}/forms/options/${req.groupId}/${req.optionId}`, {
			method: 'DELETE'
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
	}
	async deleteOptionGroupById(req: DeleteOptionGroupByIdRequest): Promise<void> {
		const response = await fetch(`${this.baseApiUrl}/forms/options/${req.id}`, {
			method: 'DELETE'
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
	}
	private readonly baseApiUrl = 'http://localhost:3000/api';
	async saveOptionGroups(req: UpdateFormOptionsDataSetRequest): Promise<void> {
		const body = req.groups.map(g => ({ ...(omit(g, 'meta')), isNew: g.meta.isNew }));
		const response = await fetch(`${this.baseApiUrl}/forms/options`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
	}
	async loadUngroupedFormOptions(): Promise<FindFormOptionGroupsResponse> {
		const response = await fetch(`${this.baseApiUrl}/forms/options`);
		const obj = await response.json();

		return FindFormOptionGroupsResponseSchema.parse(obj);
	}

	async findAllForms() {
		return [CscFormDefinition, FosaFormDefinition, ChefferieFormDefinition];
	}

	async versionExists(req: VersionExistsRequest): Promise<VersionExistsResponse> {
		return await sendRpcMessageAsync('submission-version:exists', req);
	}

	async deleteSubmission(req: DeleteSubmissionRequest): Promise<void> {
		return await sendRpcMessageAsync('submission:delete', req);
	}

	async toggleApprovalStatus(req: ToggleApprovalStatusRequest): Promise<void> {
		return await sendRpcMessageAsync('approval:toggle', req);
	}

	async getFacilityInfo(req: GetFacilityInfoRequest): Promise<GetFacilityInfoResponse> {
		return await sendRpcMessageAsync('facility-info:read', req);
	}

	async revertSubmissionVersion(req: VersionRevertRequest): Promise<VersionRevertResponse> {
		return await sendRpcMessageAsync('submission:revert', req);
	}

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

	async findIndexSuggestions(req: FindIndexSuggestionsRequest): Promise<FindIndexSuggestionsResponse> {
		return await sendRpcMessageAsync('index-suggestions:read', req);
	}

	async findSurroundingSubmissionRefs(req: FindSubmissionRefRequest): Promise<FindSubmissionRefResponse> {
		return await sendRpcMessageAsync('submission-ref:read', req);
	}

	async findAutocompleteSuggestions(form: FormType, field: FieldKey, query: string) {
		return await sendRpcMessageAsync('suggestions:read', {
			field,
			query,
			resultSize: 10,
			form
		});
	}

	async findSubmissionData({
		form,
		index,
		version
	}: FindSubmissionDataRequest) {
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

	async findFieldMappings(req: FindFieldMappingsRequest) {
		return await sendRpcMessageAsync('field-mappings:read', req)
			.then(FindFieldMappingsResponseSchema.parse);

	}

	async findFormSubmissions(form: FormType, page: number, size: number, filterQuery?: string) {
		const resultSchema = createPaginatedResultSchema(FormSubmissionSchema);
		return sendRpcMessageAsync('submissions:read', {
			form, page, size, filter: filterQuery
		}).then(resultSchema.parse);
	}

	async updateFormSubmission(req: UpdateSubmissionRequest): Promise<UpdateSubmissionResponse> {
		return sendRpcMessageAsync('submission-data:update', req);
	}
}

export function usingElectron() {
	return makeEnvironmentProviders([
		ElectronFormService,
		{
			provide: FORM_SERVICE_IMPL,
			useExisting: ElectronFormService
		}]);
}
