import { Routes } from '@angular/router';

export const schemaRoutes: Routes = [
	{
		children: [
			{
				path: 'assets',
				loadComponent: () => import('./pages/forms/schemas/library/library.page').then(m => m.LibraryPage),
				outlet: 'library'
			}
		],
		title: 'Form Designer',
		path: 'create-new',
		loadComponent: () => import('./pages/forms/schemas/schema-design.page').then(m => m.SchemaDesignPage)
	},
];
