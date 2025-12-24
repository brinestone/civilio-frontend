import { ResolveFn, Routes } from "@angular/router";
import { FormType } from "@civilio/shared";
import { hasChangesGuard } from "./guards/has-changes.guard";
import {
	ChefferieFormDefinition,
	CscFormDefinition,
	FormSchema,
	FosaFormDefinition,
} from "./model/form";

const dataResolver: ResolveFn<{ form: FormType; model: FormSchema }> = (
	route,
) => {
	return { ...(route.parent!.data as any), ...route.parent?.params };
};

const sectionRoutes: Routes = [
	{
		resolve: { target: dataResolver },
		path: ":id",
		loadComponent: () =>
			import("./pages/forms/section-page/section.page").then(
				(m) => m.SectionPage,
			),
	},
	{
		path: "",
		pathMatch: "full",
		redirectTo: ({ data }) => {
			return (data["model"] as FormSchema).sections[0].id;
		},
	},
];

export const formRoutes: Routes = [
	{
		path: ':formType/:submissionIndex/overview',
		loadComponent: () => import('./pages/forms/overview/overview.page').then(m => m.OverviewPage),
		title: 'Overview'
	},
	{
		path: 'fosa/new',
		children: sectionRoutes,
		data: {
			form: 'fosa', model: FosaFormDefinition, permissions: [
				['create', 'Submission']
			]
		},
		loadComponent: () => import('./pages/forms/form-page/form.page').then(m => m.FormPage),
		title: `Submission::FOSA`
	},
	{
		path: 'csc/new',
		children: sectionRoutes,
		data: {
			form: 'csc', model: CscFormDefinition, permissions: [
				['create', 'Submission']
			]
		},
		loadComponent: () => import('./pages/forms/form-page/form.page').then(m => m.FormPage),
		title: `Submission::CSC`
	},
	{
		path: 'chefferie/new',
		children: sectionRoutes,
		data: {
			form: 'chefferie', model: ChefferieFormDefinition, permissions: [
				['create', 'Submission']
			]
		},
		loadComponent: () => import('./pages/forms/form-page/form.page').then(m => m.FormPage),
		title: `Submission::CHEFFERIE`
	},
	{
		children: sectionRoutes,
		canDeactivate: [hasChangesGuard],
		data: {
			form: "fosa", model: FosaFormDefinition, permissions: [
				['update', 'Submission']
			]
		},
		path: "fosa/:submissionIndex",
		title: "Submission::FOSA",
		loadComponent: () =>
			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
	},
	{
		children: sectionRoutes,
		canDeactivate: [hasChangesGuard],
		data: {
			form: "chefferie", model: ChefferieFormDefinition,
			permissions: [
				['update', 'Submission']
			]
		},
		path: "chefferie/:submissionIndex",
		title: "Submission::Chefferie",
		loadComponent: () =>
			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
	},
	{
		children: sectionRoutes,
		canDeactivate: [hasChangesGuard],
		data: {
			form: "csc", model: CscFormDefinition,
			permissions: [
				['update', 'Submission']
			]
		},
		path: "csc/:submissionIndex",
		title: "Submission::CSC",
		loadComponent: () =>
			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
	},
];
