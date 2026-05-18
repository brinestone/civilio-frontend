import { NumberInput } from "@angular/cdk/coercion";
import { DatePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	inject,
	input,
	linkedSignal,
	numberAttribute,
	signal
} from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { FormRenderer } from '@app/components/form/renderer';
import { domainToStrictFormDefinition } from "@app/components/form/schema/form-designer-config";
import { formsCollection, submissionsCollection } from "@app/store/form";
import { FormsService } from "@civilio/sdk/services/forms/forms.service";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmEmptyImports } from "@spartan-ng/helm/empty";
import { HlmField, HlmFieldLabel } from "@spartan-ng/helm/field";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { injectLiveQuery } from "@tanstack/angular-db";
import { and, eq } from "@tanstack/db";
import { injectQueryParams } from "ngxtension/inject-query-params";
import { map, of } from "rxjs";

@Component({
	selector: "cv-form-data-page",
	templateUrl: "./submission-data.page.html",
	styleUrl: "./submission-data.page.scss",
	imports: [
		HlmSelectImports,
		BrnSelectImports,
		HlmEmptyImports,
		NgClass,
		HlmField,
		HlmFieldLabel,
		NgTemplateOutlet,
		HlmSkeleton,
		DatePipe,
		RouterLink,
		FormRenderer
	],
})
export class SubmissionDataPage {
	readonly index = input<number | undefined, NumberInput>(undefined, {
		transform: numberAttribute,
	});
	readonly formSlug = input<string>(undefined, { alias: "slug" });

	protected readonly isNew = computed(() => this.index() === undefined);
	protected readonly pageIndex = signal<number>(0);
	protected readonly pageSize = signal<number>(100);
	protected readonly pagination = computed(() => ({
		pageIndex: Math.max(0, this.pageIndex() - 1),
		pageSize: this.pageSize(),
	}));
	private readonly formService = inject(FormsService);
	private readonly formVersionArg = injectQueryParams('version');
	protected readonly formVersion = linkedSignal(() => this.formVersionArg())
	protected readonly formDefinition = rxResource({
		params: () => ({ slug: this.formSlug(), version: this.formVersion() }),
		stream: ({ params }) => {
			if (!params.slug) return of(undefined);
			return this.formService.findFormDefinitionByVersion(params.slug, { version: params.version || undefined }).pipe(
				map(definition => domainToStrictFormDefinition(definition))
			);
		}
	})
	protected readonly formVersions = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), pagination: this.pagination() }),
		query: ({ q, params }) =>
			q
				.from({ fv: formsCollection })
				.where(({ fv }) => eq(fv.form, params.slug))
				.limit(params.pagination.pageSize)
				.orderBy(({ fv }) => fv.createdAt, "desc")
				.offset(params.pagination.pageIndex * params.pagination.pageSize),
	});
	protected readonly submissions = injectLiveQuery({
		params: () => ({ slug: this.formSlug(), index: this.index(), fv: this.formVersion() }),
		query: ({ q, params }) =>
			q
				.from({ submissions: submissionsCollection })
				.where(
					({ submissions }) => and(
						eq(submissions.form, params.slug),
						eq(submissions.formVersion, params.fv)
					),
				)
				.select(({ submissions }) => ({
					index: submissions.index,
					recordedAt: submissions.recordedAt,
					vc: submissions.versionCount,
				})),
	});
}
