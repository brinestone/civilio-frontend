import { ResolveFn, Routes } from "@angular/router";
import { FormType } from "@civilio/shared";
import { hasChangesGuard } from "./guards/has-changes-guard";
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
			console.log(data);
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
		children: sectionRoutes,
		canDeactivate: [hasChangesGuard],
		data: { form: "fosa", model: FosaFormDefinition },
		path: "fosa/:submissionIndex",
		title: "Submission::FOSA",
		loadComponent: () =>
			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
	},
	{
		children: sectionRoutes,
		canDeactivate: [hasChangesGuard],
		data: { form: "chefferie", model: ChefferieFormDefinition },
		path: "chefferie/:submissionIndex",
		title: "Submission::Chefferie",
		loadComponent: () =>
			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
	},
	{
		children: sectionRoutes,
		canDeactivate: [hasChangesGuard],
		data: { form: "csc", model: CscFormDefinition },
		path: "csc/:submissionIndex",
		title: "Submission::CSC",
		loadComponent: () =>
			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
	},
];
