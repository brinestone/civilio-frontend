import { Routes } from '@angular/router';
import { apiConfiguredGuard } from '@app/guards/api-config-valid-guard';
import { dbConfiguredGuard } from '@app/guards/db-config-valid-guard';
import { hasChangesGuard } from './guards/has-changes-guard';
import { provideFormStore } from './store/form/data';

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
const apiConfigValidGuardFn = apiConfiguredGuard('/settings/advanced');
export const routes: Routes = [
	{
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
		providers: [provideFormStore()],
		title: 'submissions.title',
		path: 'submissions',
		loadComponent: () => import('./pages/submissions/submissions.page').then(m => m.SubmissionsPage),
	},
	{
		children: [
			{
				path: 'assets',
				loadComponent: () => import('./pages/forms/schemas/library/library.page').then(m => m.LibraryPage),
				outlet: 'library'
			}
		],
		title: 'Form Designer',
		path: 'schemas/:slug/edit/:version',
		canDeactivate: [hasChangesGuard],
		loadComponent: () => import('./pages/forms/schemas/designer-page/schema-design.page').then(m => m.SchemaDesignPage)
	},
	{
		path: 'schemas',
		loadComponent: () => import('./pages/forms/schemas/list/form-schemas-list.page').then(m => m.FormSchemasPage),
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
		providers: [provideFormStore()],
	},
	{
		path: 'forms',
		title: 'forms.page_title',
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
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
