import { Routes } from '@angular/router';

export const schemaRoutes: Routes = [
	{ path: 'create-new', loadComponent: () => import('./pages/forms/schemas/schema-design.page').then(m => m.SchemaDesignPage) },
];
