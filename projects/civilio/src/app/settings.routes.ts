import { Routes } from "@angular/router";
import { apiConfiguredGuard } from '@app/guards/api-config-valid-guard';
import { dbConfiguredGuard } from '@app/guards/db-config-valid-guard';
import { provideDatasetSdk } from "@civilio/sdk/providers";
import { hasChangesGuard } from "./guards/has-changes-guard";

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
const apiConfigValidGuardFn = apiConfiguredGuard('/settings/advanced');
export const settingsRoutes: Routes = [
	{
		path: 'general',
		title: 'settings.general.page_title',
		loadComponent: () => import('./pages/settings/general-settings/general-settings.page').then(m => m.GeneralSettingsPage)
	},
	{
		path: 'dataset-editor',
		title: 'settings.dataset.page_title',
		providers: [provideDatasetSdk()],
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
		canDeactivate: [hasChangesGuard],
		loadComponent: () => import('./pages/settings/dataset-editor/dataset-editor.page').then(m => m.DatasetEditorPage),
	},
	{
		path: 'advanced',
		title: 'settings.advanced.page_title',
		loadComponent: () => import('./pages/settings/advanced-settings/advanced-settings.page').then(m => m.AdvancedSettingsPage)
	},
	{
		path: 'about',
		title: 'settings.about.title',
		loadComponent: () => import('./pages/settings/about/about.page').then(m => m.AboutPage)
	},
	{ path: '', redirectTo: 'general', pathMatch: 'full' }
];
