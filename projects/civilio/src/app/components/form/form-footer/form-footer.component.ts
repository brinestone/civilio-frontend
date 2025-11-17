import { CdkListboxModule } from "@angular/cdk/listbox";
import { DecimalPipe, JsonPipe, KeyValuePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import {
	Component,
	computed,
	effect,
	linkedSignal
} from "@angular/core";
import { UpdateMiscConfig } from "@app/store/config";
import { allSectionErrors, currentSectionErrors, miscConfig } from "@app/store/selectors";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideHistory, lucideInfo, lucideTriangleAlert } from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { dispatch, select } from "@ngxs/store";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { isEmpty, size } from "lodash";

const miscKeys = {
	currentTab: 'form-prefs.footer.current-tab'
} as const;

@Component({
	selector: "cv-form-footer",
	viewProviders: [
		provideIcons({
			lucideTriangleAlert,
			lucideInfo,
			lucideHistory,
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
	private readonly updateMisc = dispatch(UpdateMiscConfig);
	private changingTab = false;

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
		// {
		// 	key: 'form.footer.tabs.history',
		// 	icon: 'lucideHistory'
		// },
	];
	protected readonly currentTab = select(miscConfig<string>(miscKeys.currentTab));

	protected get errorTab() {
		return this.tabs[1];
	}
	protected get descriptionTab() {
		return this.tabs[0];
	}
	protected get historyTab() {
		return this.tabs[2];
	}

	constructor() {
		effect(() => {
			const errors = this.currentSectionErrors();
			if (isEmpty(errors)) return;
			this.updateStoreTab(this.errorTab.key);
		})
	}

	protected onTabChange(tab?: string) {
		this.updateStoreTab(tab ?? this.descriptionTab.key);
	}

	protected updateStoreTab(key: string) {
		if (this.changingTab) return;
		this.changingTab = true;
		this.updateMisc(miscKeys.currentTab, key).subscribe({
			complete: () => this.changingTab = false
		});
	}
}
