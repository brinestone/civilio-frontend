import { CdkListboxModule } from "@angular/cdk/listbox";
import { JsonPipe } from "@angular/common";
import { Component, signal } from "@angular/core";
import { currentSectionErrors } from "@app/store/selectors";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertCircle, lucideInfo } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { select } from "@ngxs/store";

@Component({
	selector: "cv-form-footer",
	viewProviders: [
		provideIcons({
			lucideAlertCircle,
			lucideInfo,
		}),
	],
	imports: [TranslatePipe, NgIcon, CdkListboxModule, JsonPipe],
	templateUrl: "./form-footer.component.html",
	styleUrl: "./form-footer.component.scss",
})
export class FormFooterComponent {
	protected readonly tabs = [
		{ key: "form.footer.tabs.description", icon: "lucideInfo" },
		{ key: "form.footer.tabs.errors", icon: "lucideAlertCircle" },
	];
	protected readonly currentTab = signal<string>(this.tabs[0].key);

	protected readonly currentSectionErrors = select(currentSectionErrors);

	protected onTabChange(tab: string) {
		this.currentTab.set(tab);
	}
}
