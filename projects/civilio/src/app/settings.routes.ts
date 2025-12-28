import { Routes } from "@angular/router";
import { dbConfiguredGuard } from "./guards/config-valid.guard";
import {
	ChefferieFormDefinition,
	CscFormDefinition,
	FosaFormDefinition
} from "./model/form";
import { provideFormStore } from "./store/form";

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
export const settingsRoutes: Routes = [
	{
		path: 'general',
		title: 'settings.general',
		loadComponent: () => import('./pages/settings/general-settings/general-settings.page').then(m => m.GeneralSettingsPage)
	},
	{
		providers: [
			provideFormStore()
		],
		canActivate: [dbConfigValidGuardFn],
		path: 'field-mapping',
		title: 'settings.mapping.title',
		loadComponent: () => import('./pages/settings/field-mapping-settings/field-mapping-settings.page').then(m => m.FieldMappingSettingsPage),
		children: [
			{
				data: { form: 'fosa', model: FosaFormDefinition },
				path: 'fosa',
				title: 'Fosa Mapping Settings',
				loadComponent: () => import('./pages/settings/field-mapping-settings/mapping-page/mapping.page').then(m => m.MappingPage)
			},
			{
				data: { form: 'chefferie', model: ChefferieFormDefinition },
				path: 'chefferie',
				title: 'Chefferie Mapping Settings',
				loadComponent: () => import('./pages/settings/field-mapping-settings/mapping-page/mapping.page').then(m => m.MappingPage)
			},
			{
				data: { form: 'csc', model: CscFormDefinition },
				path: 'csc',
				title: 'CSC Mapping Settings',
				loadComponent: () => import('./pages/settings/field-mapping-settings/mapping-page/mapping.page').then(m => m.MappingPage)
			},
			{ path: '', pathMatch: 'full', redirectTo: 'fosa' }
		]
	},
	{
		path: 'advanced',
		title: 'settings.advanced.description',
		loadComponent: () => import('./pages/settings/advanced-settings/advanced-settings.page').then(m => m.AdvancedSettingsPage)
	},
	{
		path: 'about',
		title: 'settings.about.title',
		loadComponent: () => import('./pages/settings/about/about.page').then(m => m.AboutPage)
	},
	{
		path: 'users',
		title: 'settings.users.title',
		loadComponent: () => import('./pages/settings/users/users.page').then(m => m.UsersPage),
		children: [
			{
				path: 'new-user', // Create view
				data: { isNew: true, permissions: [['create', 'User']] },
				loadComponent: () => import('./pages/settings/user/user.page').then(m => m.UserPage),
			},
			{
				path: ':id', // Edit view
				loadComponent: () => import('./pages/settings/user/user.page').then(m => m.UserPage),
			}
		]
	},
	{ path: '', redirectTo: 'general', pathMatch: 'full' }
];
