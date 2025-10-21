import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	input,
	OnInit
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormHeaderComponent } from '@app/components/form/form-header/form-header.component';
import {
	FormSchema,
	HasPendingChanges
} from '@app/model/form';
import { FormType } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideCircleAlert, lucideSave, lucideTrash2, lucideUnlink } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { last } from 'lodash';
import { injectRouteData } from 'ngxtension/inject-route-data';
import { filter, map, Observable } from 'rxjs';

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
	readonly submissionIndex = input.required<string>();

	private routeData = injectRouteData();
	private route = inject(ActivatedRoute);
	private navigate = dispatch(Navigate);
	private router = inject(Router);


	protected readonly activeSection = toSignal(this.router.events.pipe(
		takeUntilDestroyed(),
		filter(event => event instanceof NavigationEnd),
		map(() => last(this.router.url.split('/'))),
	), { initialValue: last(this.router.url.split('/')) as string });
	protected relevanceRegistry: Record<string, () => boolean> = {};
	protected formType = computed(() => this.routeData()['form'] as FormType);
	protected formModel = computed(() => this.routeData()['model'] as FormSchema);

	constructor() {
		effect(() => {
			console.log(this.activeSection());
		})
	}
	ngAfterViewInit(): void {
		// throw new Error('Method not implemented.');
	}
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}
	ngOnInit(): void {
	}

	protected onIndexChanged(index: number) {
		this.navigate(['..', index], undefined, { relativeTo: this.route })
	}

}
