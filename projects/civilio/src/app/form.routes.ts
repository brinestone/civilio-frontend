import { Routes } from "@angular/router";
import { ChefferieFormDefinition, CscFormDefinition, FosaFormDefinition } from "./model/form";
import { hasChangesGuard } from "./guards/has-changes-guard";

export const formRoutes: Routes = [
  { canDeactivate: [hasChangesGuard], data: { form: 'fosa', model: FosaFormDefinition }, path: 'fosa/:submissionIndex', title: 'Submission::FOSA', loadComponent: () => import('./pages/forms/form.page').then(m => m.FormPage) },
  { canDeactivate: [hasChangesGuard], data: { form: 'chefferie', model: ChefferieFormDefinition }, path: 'chefferie/:submissionIndex', title: 'Submission::Chefferie', loadComponent: () => import('./pages/forms/form.page').then(m => m.FormPage) },
  { canDeactivate: [hasChangesGuard], data: { form: 'csc', model: CscFormDefinition }, path: 'csc/:submissionIndex', title: 'Submission::CSC', loadComponent: () => import('./pages/forms/form.page').then(m => m.FormPage) },
];
