import { BooleanInput } from "@angular/cdk/coercion";
import {
	Component,
	HostBinding,
	booleanAttribute,
	computed,
	inject,
	input
} from "@angular/core";
import { MaskPipe } from "@app/pipes";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCopy } from "@ng-icons/lucide";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTd } from "@spartan-ng/helm/table";
import { toast } from "ngx-sonner";

@Component({
	selector: 'cv-version-cell',
	imports: [HlmButton, NgIcon, MaskPipe, TranslatePipe, HlmTd],
	viewProviders: [
		provideIcons({
			lucideCopy
		})
	],
	host: {
		class: 'text-sm',
		role: 'table-cell'
	},
	template: `
		<td hlmTd>
			@if (version()) {
			<span>{{ version() | mask }}</span>
			@if(showCopyButton()) {
				<button [title]="'misc.actions.copy_version' | translate" (click)="onCopyVersionButtonClicked()" size="sm"
							variant="ghost" hlmBtn>
				<ng-icon name="lucideCopy"/>
			</button>
			}
		}
	</td>
	`
})
export class VersionCell {
	readonly version = input<string>();
	readonly showCopyButton = input<boolean, BooleanInput>(true, {
		alias: 'allowCopy',
		transform: booleanAttribute
	});

	@HostBinding('class.inline-flex')
	@HostBinding('class.gap-2')
	@HostBinding('class.items-center')
	protected readonly versionDefined = computed(() => !!this.version())

	private ts = inject(TranslateService);

	protected async onCopyVersionButtonClicked() {
		await navigator.clipboard.writeText(this.version() as string);
		toast.info(this.ts.instant('msg.clipboard_copied_text', { value: 'Version' }));
	}
}
