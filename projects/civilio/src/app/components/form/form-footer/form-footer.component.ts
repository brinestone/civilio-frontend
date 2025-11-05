import { CdkListboxModule } from "@angular/cdk/listbox";
import { DecimalPipe, JsonPipe, KeyValuePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	linkedSignal,
	TemplateRef,
	viewChildren,
} from "@angular/core";
import { allSectionErrors, currentSectionErrors } from "@app/store/selectors";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideInfo, lucideTriangleAlert } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { select } from "@ngxs/store";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { isEmpty, size } from "lodash";

@Component({
	selector: "cv-form-footer",
	viewProviders: [
		provideIcons({
			lucideTriangleAlert,
			lucideInfo,
		}),
	],
	imports: [
		TranslatePipe,
		NgIcon,
		CdkListboxModule,
		HlmBadgeImports,
		DecimalPipe,
		NgClass,
		KeyValuePipe,
		JsonPipe,
		NgTemplateOutlet,
	],
	templateUrl: "./form-footer.component.html",
	styleUrl: "./form-footer.component.scss",
})
export class FormFooterComponent {
	protected readonly allSectionErrors = select(allSectionErrors);
	protected readonly currentSectionErrors = select(currentSectionErrors);
	protected readonly tabs = [
		{
			key: "form.footer.tabs.description",
			icon: "lucideInfo",
			template: "descriptionTemplate",
		},
		{
			key: "form.footer.tabs.errors",
			icon: "lucideTriangleAlert",
			templateName: "errorsTemplate",
			badgeVariant: "destructive" as
				| "destructive"
				| "default"
				| "secondary"
				| "outline",
			badgeValue: computed(() => size(this.currentSectionErrors())),
		},
	];
	protected readonly currentTab = linkedSignal(() => {
		const errors = this.currentSectionErrors();
		if (isEmpty(errors)) return this.tabs[0].key;
		return this.tabs[1].key;
	});
	protected get errorTab() {
		return this.tabs[1];
	}
	protected get descriptionTab() {
		return this.tabs[0];
	}

	protected onTabChange(tab: string) {
		this.currentTab.set(tab);
	}
}
