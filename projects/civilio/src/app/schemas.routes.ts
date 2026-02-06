import { Routes } from '@angular/router';

export const schemaRoutes: Routes = [
	{
		children: [
			{
				path: 'import-dataset',
				outlet: 'importer',
				loadComponent: () => import('./pages/importers/dataset/dataset-import.page').then(m => m.DatasetImportPage),
			},
			{
				path: 'import-file',
				outlet: 'importer',
				loadComponent: () => import('./pages/importers/file/file-importer.page').then(m => m.FilePage)
			}
		],
		title: 'Form Designer',
		path: 'create-new',
		loadComponent: () => import('./pages/forms/schemas/schema-design.page').then(m => m.SchemaDesignPage)
	},
];
