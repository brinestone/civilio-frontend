import { NgClass } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { SubmissionsDatabase } from "@app/store/form/submissions";
import { SubmissionsService } from "@civilio/sdk/services/submissions/submissions.service";
import { liveQuery } from "dexie";
import { catchError, EMPTY, from, switchMap } from "rxjs";

@Component({
	selector: "cv-form-data-page",
	templateUrl: "./submission-data.page.html",
	styleUrl: "./submission-data.page.scss",
	imports: [
		NgClass
	]
})
export class SubmissionDataPage {
	readonly index = input.required<string>();
	readonly formSlug = input.required<string>({ alias: 'slug' })

	private readonly submissionsDb = inject(SubmissionsDatabase);
	private readonly submissionService = inject(SubmissionsService);
	protected readonly isNew = computed(() => this.index() === "new" || !this.index());
	protected readonly otherSubmissions = rxResource({
		defaultValue: [],
		params: () => ({
			slug: this.formSlug(),
			index: this.index(),
			isNew: this.isNew(),
		}),
		stream: ({ params }) => {
			if (params.isNew) return EMPTY;
			return from(liveQuery(() => this.submissionsDb.submissions
			.where('[index+form]').equals([params.index, params.slug]).toArray()));
		}
	})
}
