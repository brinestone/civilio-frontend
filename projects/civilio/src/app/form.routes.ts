import { Routes } from "@angular/router";

export const formRoutes: Routes = [
  { data: { form: 'fosa' }, path: 'fosa/:submissionIndex', title: 'Submission::FOSA', loadComponent: () => import('./pages/forms/fosa/fosa.page').then(m => m.FosaPage) },
  { data: { form: 'chefferie' }, path: 'chefferie/:submissionIndex', title: 'Submission::Chefferie', loadComponent: () => import('./pages/forms/chefferie/chefferie.page').then(m => m.ChefferiePage) },
  { data: { form: 'csc' }, path: 'csc/:submissionIndex', title: 'Submission::CSC', loadComponent: () => import('./pages/forms/csc/csc.page').then(m => m.CscPage) },
];
