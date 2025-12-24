import { inject, Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";

// Enhanced strategy to handle route data:
@Injectable()
export class TranslateTitleStrategy extends TitleStrategy {
	private translate = inject(TranslateService);
	private title = inject(Title);
	private currentSubscription?: Subscription;
	override updateTitle(routerState: RouterStateSnapshot): void {
		this.currentSubscription?.unsubscribe();
		const title = this.getTitleFromRoute(routerState);

		if (title) {
			this.currentSubscription = this.translate.getStreamOnTranslationChange(title.key).subscribe(translatedTitle => {
				this.title.setTitle(`${translatedTitle} | CivilIO`);
			});
		}
	}

	private getTitleFromRoute(routerState: RouterStateSnapshot): { key: string, params?: any } | null {
		let route = routerState.root;
		let titleData = null;

		while (route.firstChild) {
			route = route.firstChild;
		}

		// Check for title in data property
		if (route.data && route.data['titleKey']) {
			titleData = {
				key: route.data['titleKey'],
				params: route.data['titleParams']
			};
		}
		// Fallback to title property
		else if (route.title) {
			titleData = { key: route.title };
		}

		return titleData;
	}
}
