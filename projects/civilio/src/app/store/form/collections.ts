import { inject } from "@angular/core";
import { FormsService } from "@civilio/sdk/services/forms/forms.service";
import { SubmissionsService } from "@civilio/sdk/services/submissions/submissions.service";
import {
	BasicIndex,
	createCollection
} from "@tanstack/db";
import { QueryClient } from "@tanstack/query-core";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { entries } from "lodash";
import { lastValueFrom } from "rxjs";
import { Md5 } from 'ts-md5';

const queryClient = new QueryClient();

export const queryKeys = {
	submissions: "submissions",
	formVersions: "fv",
	formDefinitions: "fd"
} as const;


function computeHashCode(...values: any[]) {
	const md5 = new Md5();
	for (const value of values) {
		if (value === null || value === undefined) continue;
		else if (typeof value == 'string') md5.appendStr(value);
		else if ((['number', 'boolean']).includes(typeof value)) md5.appendStr(String(value));
		else if (Array.isArray(value)) md5.appendStr(computeHashCode(...value))
		else if (typeof value == 'object') {
			for (const [k, v] of entries(value)) {
				md5.appendStr(k);
				md5.appendStr(computeHashCode(v));
			}
		}
	}
	return md5.end().toString();
}

export const submissionCollection = createCollection(
	queryCollectionOptions({
		queryKey: ({ offset, cursor, limit, where, orderBy }) => [queryKeys.submissions, cursor ?? offset],
		// queryKey: ({ offset, cursor, limit, where, orderBy }) => [queryKeys.submissions, computeHashCode(queryKeys.submissions, cursor ?? offset, limit, where ?? {}, orderBy ?? {})],
		staleTime: 1000 * 60 * 60, // 1 hour
		refetchInterval: 500 * 60 * 60, // 30 minutes
		syncMode: "on-demand",
		queryFn: async ({ meta, pageParam }) => {
			const service = inject(SubmissionsService);
			const options = meta?.loadSubsetOptions;
			const result = await lastValueFrom(
				service.lookupFormSubmissions({
					limit: options?.limit || 10000,
					// form: options?..find((f) => isEqual(f.field, ["form"]))?.value,
					// includeArchived: options.filters.find((f) =>
					//   isEqual(f.field, ["archived"]),
					// )?.value,
					// fv: options.filters.find((f) => isEqual(f.field, ["fv"]))?.value,
					page: (pageParam as number) || 0,
				})
			);
			return result.data;
		},
		queryClient,
		getKey: (submission) =>
			[submission.index, submission.form, submission.formVersion].join("|"),
	}),
);

export const formVersionCollection = createCollection(
	queryCollectionOptions({
		queryKey: ({ offset, cursor, limit, where, orderBy }) => [queryKeys.formVersions, cursor ?? offset],
		// queryKey: ({ offset, cursor, limit, where, orderBy }) => [queryKeys.formVersions, computeHashCode(queryKeys.formVersions, cursor ?? offset, limit, where ?? {}, orderBy ?? {})],
		staleTime: 1000 * 60 * 60, // 1 hour
		refetchInterval: 500 * 60 * 60, // 30 minutes
		syncMode: "on-demand",
		queryFn: async ({ meta, pageParam }) => {
			const service = inject(FormsService);
			const options = meta?.loadSubsetOptions;
			const result = await lastValueFrom(
				service.lookupFormVersions({
					limit: options?.limit || 10000,
					offset: (pageParam as number) || 0,
					// form: options.filters.find((f) => isEqual(f.field, ["form"]))?.value,
				})
			);
			return result;
		},
		queryClient,
		getKey: (formVersion) => formVersion.id,
	}),
);

formVersionCollection.createIndex((row) => row.createdAt, {
	indexType: BasicIndex,
});
formVersionCollection.createIndex((row) => row.updatedAt, {
	indexType: BasicIndex,
});
