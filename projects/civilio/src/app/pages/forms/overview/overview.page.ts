import { JsonPipe } from '@angular/common';
import {
	Component,
	effect,
	inject,
	input,
	resource,
	untracked
} from '@angular/core';
import { FORM_SERVICE } from '@app/services/form';
import { InitVersioning } from '@app/store/form';
import {
	FindSubmissionVersionsRequestSchema,
	FindSubmissionVersionsResponse,
	FormType
} from '@civilio/shared';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { dispatch } from '@ngxs/store';
import { intersection } from 'lodash';

@Component({
	selector: 'cv-overview',
	viewProviders: [
		provideIcons({
			lucideTrash2
		})
	],
	imports: [
		JsonPipe
	],
	templateUrl: './overview.page.html',
	styleUrl: './overview.page.scss',
})
export class OverviewPage {
	readonly submissionIndex = input<string>();
	readonly formType = input<FormType>();

	private readonly initVersioning = dispatch(InitVersioning);
	private readonly formService = inject(FORM_SERVICE);
	protected selectedVersion = resource({
		defaultValue: null,
		params: () => ({
			form: this.formType()!,
			index: this.submissionIndex(),
		}),
		loader: async ({ params: { index, form } }) => {
			if (index === null) return null;
			const v = await this.formService.findCurrentSubmissionVersion({
				index,
				form,
			});
			return v?.version ?? null;
		}
	});
	protected readonly versions = resource({
		defaultValue: [],
		params: () => ({
			index: this.submissionIndex(),
			form: this.formType()
		}),
		loader: async ({ params: { form, index } }) => {
			if (index == null) return [] as FindSubmissionVersionsResponse;
			return await this.formService.findSubmissionVersions(FindSubmissionVersionsRequestSchema.parse({
				form, index: index, limit: 50
			}));
		},
	});
	constructor() {
		effect(() => {
			const status = this.versions.status()
			if (intersection([status], ['resolved']).length == 0 || this.versions.value().length > 0) return;
			this.initVersioning(untracked(this.submissionIndex), untracked(this.formType)!).subscribe({
				complete: () => {
					this.versions.reload();
					this.selectedVersion.reload();
				}
			});
		});
	}
}
