import { Routes } from "@angular/router";
import { provideSubmissionsSdk } from "@civilio/sdk/providers";
import { hasChangesGuard } from "./guards/has-changes-guard";


export const formRoutes: Routes = [
	{
		path: ":slug",
		loadComponent: () =>
			import("./layouts/forms/form.layout").then((m) => m.FormLayout),
		children: [
			{
				title: "form.header.toolbar.tabs.designer.title",
				path: "designer",
				canDeactivate: [hasChangesGuard],
				loadComponent: () =>
					import("./pages/forms/designer/designer-page/schema-design.page").then(
						(m) => m.SchemaDesignPage,
					),
				children: [
					{
						path: "",
						outlet: "side-bar",
						loadComponent: () =>
							import("./pages/forms/designer/library/library.page").then(
								(m) => m.LibraryPage,
							),
					},
				],
			},
			{
				title: "form.header.toolbar.tabs.overview.title",
				path: "overview",
				loadComponent: () =>
					import("./pages/forms/overview/form-overview.page").then(
						(m) => m.FormOverviewPage,
					),
			},
			{
				providers: [provideSubmissionsSdk()],
				path: "submissions",
				loadComponent: () =>
					import("./pages/forms/submissions/form-submission.page").then(
						(m) => m.FormSubmissionsPage,
					),
			},
			{
				providers: [provideSubmissionsSdk()],
				path: 'submissions/new',
				loadComponent: () => import('./pages/forms/submission-data/submission-data.page').then(m => m.SubmissionDataPage)
			},
			{ path: "", pathMatch: "full", redirectTo: "overview" },
		],
	},
	{
		title: "misc.forms",
		path: "",
		pathMatch: "full",
		loadComponent: () =>
			import("./pages/forms/all-forms/all-forms.page").then(
				(m) => m.AllFormsPage,
			),
	},
];
