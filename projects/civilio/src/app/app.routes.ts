import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { dbConfiguredGuard } from './guards/config-valid.guard';
import { provideFormStore } from './store/form';

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
const authGuardFn = authGuard('/auth/login')
export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./auth.routes').then(m => m.authRoutes),
		loadComponent: () => import('./layouts/auth/auth.layout').then(m => m.AuthLayout),
	},
	{
		path: '', loadComponent: () => import('./layouts/base/base.layout').then(m => m.BaseLayout),
		children: [
			{
				canActivate: [authGuardFn, dbConfigValidGuardFn],
				providers: [provideFormStore()],
				title: 'Form Submissions',
				path: 'submissions',
				loadComponent: () => import('./pages/submissions/submissions.page').then(m => m.SubmissionsPage),
			},
			{
				path: 'forms',
				loadComponent: () => import('./layouts/form/form.layout').then(m => m.FormLayout),
				canActivate: [authGuardFn, dbConfigValidGuardFn],
				providers: [provideFormStore()],
				loadChildren: () => import('./form.routes').then(m => m.formRoutes)
			},
			{
				canActivate: [authGuardFn],
				title: 'Settings',
				path: 'settings',
				loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
				loadChildren: () => import('./settings.routes').then(m => m.settingsRoutes)
			},
			{ path: '', redirectTo: 'submissions', pathMatch: 'full' }
		]
	}
];
