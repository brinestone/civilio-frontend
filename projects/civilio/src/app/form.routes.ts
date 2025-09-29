import { Routes } from "@angular/router";
import { ChefferieFormDefinition, CscFormDefinition, FosaFormDefinition } from "./model";

export const formRoutes: Routes = [
  { data: { form: 'fosa', model: FosaFormDefinition }, path: 'fosa/:submissionIndex', title: 'Submission::FOSA', loadComponent: () => import('./pages/forms/fosa/fosa.page').then(m => m.FosaPage) },
  { data: { form: 'chefferie', model: ChefferieFormDefinition }, path: 'chefferie/:submissionIndex', title: 'Submission::Chefferie', loadComponent: () => import('./pages/forms/chefferie/chefferie.page').then(m => m.ChefferiePage) },
  { data: { form: 'csc', model: CscFormDefinition }, path: 'csc/:submissionIndex', title: 'Submission::CSC', loadComponent: () => import('./pages/forms/csc/csc.page').then(m => m.CscPage) },
];
