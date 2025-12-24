import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { dbConfiguredGuard } from './guards/config-valid.guard';
import { provideFormStore } from './store/form';
import { permissionGuard } from './guards/permission.guard';
import { importProvidersFrom } from '@angular/core';
import { NgxJdenticonModule } from 'ngx-jdenticon';

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
const authGuardFn = authGuard('/auth/login')
export const routes: Routes = [
	{
		path: 'forbidden',
		title: 'forbidden.title',
		loadComponent: () => import('./pages/forbidden/forbidden.page').then(m => m.ForbiddenPage)
	},
	{
		path: 'auth',
		canActivateChild: [permissionGuard],
		loadChildren: () => import('./auth.routes').then(m => m.authRoutes),
		loadComponent: () => import('./layouts/auth/auth.layout').then(m => m.AuthLayout),
	},
	{
		canActivateChild: [authGuardFn, permissionGuard],
		providers: [importProvidersFrom(NgxJdenticonModule)],
		path: '', loadComponent: () => import('./layouts/base/base.layout').then(m => m.BaseLayout),
		children: [
			{
				data: {
					permissions: [
						['read', 'Submission']
					]
				},
				canActivate: [dbConfigValidGuardFn],
				providers: [provideFormStore()],
				title: 'submissions.title',
				path: 'submissions',
				loadComponent: () => import('./pages/submissions/submissions.page').then(m => m.SubmissionsPage),
			},
			{
				path: 'forms',
				data: {
					permissions: [
						['read', 'Submission'],
					]
				},
				loadComponent: () => import('./layouts/form/form.layout').then(m => m.FormLayout),
				canActivate: [dbConfigValidGuardFn],
				providers: [provideFormStore()],
				loadChildren: () => import('./form.routes').then(m => m.formRoutes)
			},
			{
				canActivateChild: [permissionGuard],
				title: 'settings.title',
				path: 'settings',
				loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
				loadChildren: () => import('./settings.routes').then(m => m.settingsRoutes)
			},
			{ path: '', redirectTo: 'submissions', pathMatch: 'full' }
		]
	}
];
