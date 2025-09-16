import { Routes } from '@angular/router';
import { conigValidGuard } from './guards/conig-valid-guard';

export const routes: Routes = [
  {
    canActivate: [conigValidGuard],
    title: 'Form Submissions',
    path: 'submissions', loadComponent: () => import('./pages/submissions/submissions.page').then(m => m.SubmissionsPage),
  },
  { title: 'Settings', path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage) },
  { path: '', redirectTo: 'submissions', pathMatch: 'full' }
];
