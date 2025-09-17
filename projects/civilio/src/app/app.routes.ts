import { Routes } from '@angular/router';
import { conigValidGuard } from './guards/conig-valid-guard';

const configValidGuardFn = conigValidGuard('/settings');
export const routes: Routes = [
  {
    canActivate: [configValidGuardFn],
    title: 'Form Submissions',
    path: 'submissions', loadComponent: () => import('./pages/submissions/submissions.page').then(m => m.SubmissionsPage),
  },
  {
    title: 'Settings', path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage), children: [
      { path: 'general', title: 'General Settings', loadComponent: () => import('./pages/settings/general-settings/general-settings.page').then(m => m.GeneralSettingsPage) },
      { path: 'field-mapping', title: 'Field Mapping', loadComponent: () => import('./pages/settings/field-mapping-settings/field-mapping-settings.page').then(m => m.FieldMappingSettingsPage) },
      { path: 'advanced', title: 'Advanced Settings', loadComponent: () => import('./pages/settings/advanced-settings/advanced-settings.page').then(m => m.AdvancedSettingsPage) },
      { path: '', redirectTo: 'general', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'submissions', pathMatch: 'full' }
];
