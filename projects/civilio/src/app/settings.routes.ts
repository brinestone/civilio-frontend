import { Routes } from "@angular/router";
import { provideFormStore } from "./store/form";
import {
	ChefferieFormDefinition,
	CscFormDefinition,
	FosaFormDefinition
} from "./model/form";
import { hasChangesGuard } from "./guards/has-changes-guard";
import { provideDatasets } from "./store/dataset";
import { apiConfiguredGuard } from '@app/guards/api-config-valid-guard';
import { dbConfiguredGuard } from '@app/guards/db-config-valid-guard';

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
const apiConfigValidGuardFn = apiConfiguredGuard('/settings/advanced');
export const settingsRoutes: Routes = [
	{
		path: 'general',
		title: 'settings.general.page_title',
		loadComponent: () => import('./pages/settings/general-settings/general-settings.page').then(m => m.GeneralSettingsPage)
	},
	{
		path: 'choice-editor',
		title: 'settings.dataset.page_title',
		providers: [provideDatasets()],
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
		canDeactivate: [hasChangesGuard],
		loadComponent: () => import('./pages/settings/choice-editor/choice-editor.page').then(m => m.ChoiceEditorPage),
	},
	{
		providers: [
			provideFormStore()
		],
		path: 'forms',
		title: 'settings.forms.page_title',
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
		loadComponent: () => import('./pages/settings/forms/forms.page').then(m => m.FormsPage)
	},
	{
		providers: [
			provideFormStore()
		],
		canActivate: [dbConfigValidGuardFn, apiConfigValidGuardFn],
		path: 'field-mapping',
		title: 'settings.mapping.title',
		loadComponent: () => import('./pages/settings/field-mapping-settings/field-mapping-settings.page').then(m => m.FieldMappingSettingsPage),
		children: [
			{
				data: { form: 'fosa', model: FosaFormDefinition },
				path: 'fosa',
				title: 'settings.mapper.fosa.title',
				loadComponent: () => import('./pages/settings/field-mapping-settings/mapping-page/mapping.page').then(m => m.MappingPage)
			},
			{
				data: { form: 'chefferie', model: ChefferieFormDefinition },
				path: 'chefferie',
				title: 'settings.mapper.chiefdom.title',
				loadComponent: () => import('./pages/settings/field-mapping-settings/mapping-page/mapping.page').then(m => m.MappingPage)
			},
			{
				data: { form: 'csc', model: CscFormDefinition },
				path: 'csc',
				title: 'settings.mapper.csc.title',
				loadComponent: () => import('./pages/settings/field-mapping-settings/mapping-page/mapping.page').then(m => m.MappingPage)
			},
			{ path: '', pathMatch: 'full', redirectTo: 'fosa' }
		]
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
