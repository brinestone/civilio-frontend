import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	OnInit
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormHeaderComponent } from '@app/components/form/form-header/form-header.component';
import {
	FormSchema,
	HasPendingChanges
} from '@app/model/form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideCircleAlert, lucideSave, lucideTrash2, lucideUnlink } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { Observable } from 'rxjs';

@Component({
	selector: 'cv-form-page',
	viewProviders: [
		{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
		provideIcons({
			lucideUnlink,
			lucideChevronLeft,
			lucideChevronRight,
			lucideSave,
			lucideTrash2,
			lucideCircleAlert
		})
	],
	imports: [
		TranslatePipe,
		NgIcon,
		RouterLink,
		RouterOutlet,
		FormHeaderComponent,
		RouterLinkActive
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form.page.html',
	styleUrl: './form.page.scss'
})
export class FormPage implements AfterViewInit, HasPendingChanges, OnInit {
	protected relevanceRegistry: Record<string, () => boolean> = {};
	private routeData = injectRouteData();
	protected formModel = computed(() => this.routeData()['model'] as FormSchema);

	ngAfterViewInit(): void {
		// throw new Error('Method not implemented.');
	}
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}
	ngOnInit(): void {
		// throw new Error('Method not implemented.');
	}

}
