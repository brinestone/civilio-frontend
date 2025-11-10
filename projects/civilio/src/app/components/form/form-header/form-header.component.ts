import { Component, inject, input, linkedSignal, output, resource, signal } from '@angular/core';
import { FieldMapperComponent } from '@app/components';
import { FormSchema } from '@app/model/form';
import { FORM_SERVICE } from '@app/services/form';
import { FormType } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideSave, lucideTrash2, lucideUnlink2 } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { derivedFrom } from 'ngxtension/derived-from';
import { debounceTime, map, pipe } from 'rxjs';
import z from 'zod';
import { HlmH4 } from '@spartan-ng/helm/typography';
import { select } from '@ngxs/store';
import { facilityName } from '@app/store/selectors';

@Component({
	selector: 'cv-form-header',
	viewProviders: [
		provideIcons({
			lucideChevronRight,
			lucideChevronLeft,
			lucideUnlink2,
			lucideSave,
			lucideTrash2
		})
	],
	imports: [
		HlmButton,
		NgIcon,
		TranslatePipe,
		FieldMapperComponent,
		BrnSheetImports,
		HlmSheetImports,
		HlmAutocompleteImports,
		HlmH4,
	],
	templateUrl: './form-header.component.html',
	styleUrl: './form-header.component.scss'
})
export class FormHeaderComponent {
	readonly formType = input<FormType>();
	readonly formSchema = input<FormSchema>();
	readonly index = input<number | string>(undefined, { alias: 'submissionIndex' });
	readonly canGoNextPage = input<boolean>();
	readonly canGoPrevPage = input<boolean>();
	readonly nextSubmission = output();
	readonly prevSubmission = output();
	readonly indexJump = output<number>();

	private readonly formService = inject(FORM_SERVICE);

	protected readonly facilityName = select(facilityName);
	protected readonly mapperSheetState = signal<BrnDialogState>('closed');
	protected readonly submissionIndex = linkedSignal(() => {
		const index = this.index();
		return index === null ? null : Number(index);
	})
	protected readonly indexInputFilter = linkedSignal(() => String(this.index() ?? ''))
	protected readonly debouncedIndexFilter = derivedFrom([this.indexInputFilter], pipe(
		map(([v]) => v),
		debounceTime(500)
	), { initialValue: '' });
	protected readonly indexSuggestions = resource({
		defaultValue: [],
		params: () => ({ form: this.formType(), filter: this.debouncedIndexFilter() }),
		loader: async ({ params: { filter, form } }) => {
			if (!form) return [];
			if (!filter || !z.string().regex(/^\d+$/).safeParse(filter).success) return [];
			return this.formService.findIndexSuggestions(form, filter);
		}
	});

	protected onAutoCompleteIndexValueChanged(index: number | null) {
		if (index === null) return;
		this.indexJump.emit(index);
	}
}
