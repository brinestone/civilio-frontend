import {
	Component,
	HostBinding,
	computed,
	inject,
	input
} from "@angular/core";
import { MaskPipe } from "@app/pipes";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCopy } from "@ng-icons/lucide";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { HlmButton } from "@spartan-ng/helm/button";
import { toast } from "ngx-sonner";

@Component({
	selector: 'cv-version-cell',
	imports: [HlmButton, NgIcon, MaskPipe, TranslatePipe],
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
			@if (version()) {
			<span>{{ version() | mask }}</span>
			@if(allowCopy()) {
				<button [title]="'misc.actions.copy_version' | translate" (click)="onCopyVersionButtonClicked()" size="sm"
							variant="ghost" hlmBtn>
				<ng-icon name="lucideCopy"/>
			</button>
			}
		}
	`
})
export class VersionCell {
	readonly version = input<string>();
	readonly allowCopy = input<boolean>();

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
