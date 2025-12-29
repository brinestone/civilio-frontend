import { Routes } from '@angular/router';
import { dbConfiguredGuard } from './guards/config-valid-guard';
import { provideFormStore } from './store/form';

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
export const routes: Routes = [
	{
		canActivate: [dbConfigValidGuardFn],
		providers: [provideFormStore()],
		title: 'submissions.title',
		path: 'submissions',
		loadComponent: () => import('./pages/submissions/submissions.page').then(m => m.SubmissionsPage),
	},
	{
		path: 'forms',
		loadComponent: () => import('./layouts/form/form.layout').then(m => m.FormLayout),
		canActivate: [dbConfigValidGuardFn],
		providers: [provideFormStore()],
		loadChildren: () => import('./form.routes').then(m => m.formRoutes)
	},
	{
		title: 'settings.title',
		path: 'settings',
		loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
		loadChildren: () => import('./settings.routes').then(m => m.settingsRoutes)
	},
	{ path: '', redirectTo: 'submissions', pathMatch: 'full' }
];
