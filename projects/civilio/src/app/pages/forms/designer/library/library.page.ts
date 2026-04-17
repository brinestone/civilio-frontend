import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsService } from '@civilio/sdk/services/forms/forms.service';

@Component({
	selector: 'cv-library',
	imports: [],
	templateUrl: './library.page.html',
	styleUrl: './library.page.scss',
})
export class LibraryPage {
	readonly slug = input<string>();

	private readonly formService = inject(FormsService);

	protected readonly libraryItems = rxResource({
		// params: () => ({ slug: this.slug() }),
		stream: () => {
			return this.formService.findLibraryItems();
		}
	})
}
