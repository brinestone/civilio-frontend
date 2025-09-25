import { Routes } from "@angular/router";
import { dbConfiguredGuard } from "./guards/conig-valid-guard";
import { provideFormStore } from "./store/form";

const dbConfigValidGuardFn = dbConfiguredGuard('/settings/advanced');
export const settingsRoutes: Routes = [
  { path: 'general', title: 'General Settings', loadComponent: () => import('./pages/settings/general-settings/general-settings.page').then(m => m.GeneralSettingsPage) },
  {
    providers: [
      provideFormStore()
    ],
    canActivate: [dbConfigValidGuardFn],
    path: 'field-mapping',
    title: 'Field mapping Settings',
    loadComponent: () => import('./pages/settings/field-mapping-settings/field-mapping-settings.page').then(m => m.FieldMappingSettingsPage), children: [
      { path: 'fosa', title: 'Fosa Mapping Settings', loadComponent: () => import('./pages/settings/field-mapping-settings/fosa/fosa.page').then(m => m.FosaPage) },
      { path: 'chefferie', title: 'Chefferie Mapping Settings', loadComponent: () => import('./pages/settings/field-mapping-settings/chiefdom/chiefdom.page').then(m => m.ChiefdomPage) },
      { path: 'csc', title: 'CSC Mapping Settings', loadComponent: () => import('./pages/settings/field-mapping-settings/csc/csc.page').then(m => m.CscPage) },
      { path: '', pathMatch: 'full', redirectTo: 'fosa' }
    ]
  },
  { path: 'advanced', title: 'Advanced Settings', loadComponent: () => import('./pages/settings/advanced-settings/advanced-settings.page').then(m => m.AdvancedSettingsPage) },
  { path: '', redirectTo: 'general', pathMatch: 'full' }
];
