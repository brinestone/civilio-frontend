import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, ChangeDetectorRef, Component, effect, inject, input, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SetServerUrl } from '@app/store/config';
import { apiBaseUrl } from '@app/store/selectors';
import { ApiConfigInput } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGlobe, lucideLoader } from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { dispatch, select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { toast } from 'ngx-sonner';

@Component({
	selector: 'cv-api-params-config',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
		provideIcons({
			lucideGlobe,
			lucideLoader
		})
	],
	imports: [
		HlmFieldImports,
		FormsModule,
		HlmInput,
		NgIcon,
		HlmInputGroupImports,
		TranslatePipe
	],
	templateUrl: './api-params-config.component.html',
	styleUrl: './api-params-config.component.scss',
})
export class ApiParamsConfigComponent {
	readonly discoveringServer = input<BooleanInput, boolean>(false, {
		transform: booleanAttribute
	});
	readonly changed = output();
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly ts = inject(TranslateService);
	private readonly setUrl = dispatch(SetServerUrl);
	protected readonly model: ApiConfigInput = {};
	protected readonly apiUrl = select(apiBaseUrl);
	protected onFormSubmit(form: NgForm) {
		const { apiUrl } = form.value;
		if (!apiUrl || this.apiUrl() === apiUrl) return;
		this.setUrl(apiUrl).subscribe({
			error: (e: Error) => {
				toast.error(this.ts.instant('msg.error.title'), { description: e.message });
				this.model.baseUrl = this.apiUrl();
				this.cdr.markForCheck();
			},
			complete: () => this.changed.emit()
		})
	}
	constructor() {
		effect(() => {
			this.model.baseUrl = this.apiUrl();
		})
	}
}
