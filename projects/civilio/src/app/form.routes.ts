import { ResolveFn, Routes } from "@angular/router";
import { FormType } from "@civilio/shared";
import { hasChangesGuard } from "./guards/has-changes-guard";
import {
  ChefferieFormDefinition,
  CscFormDefinition,
  FormSchema,
  FosaFormDefinition,
} from "./model/form";
import { provideSubmissionsSdk } from "@civilio/sdk/providers";

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
    title: (snapshot) => {
      return snapshot.params["id"] + ".title";
    },
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
        path: "data",
        loadComponent: () =>
          import("./layouts/form-data/form-data.layout").then(
            (m) => m.FormDataLayout,
          ),
        children: [
          {
            path: ":index",
            loadComponent: () =>
              import("./pages/forms/submission-data/submission-data.page").then(
                (m) => m.SubmissionDataPage,
              ),
          },
        ],
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

// export const formRoutes: Routes = [
// 	{
// 		path: ':formType/:submissionIndex/overview',
// 		loadComponent: () => import('./pages/forms/overview/overview.page').then(m => m.OverviewPage),
// 		title: 'overview.page_title'
// 	},
// 	{
// 		path: 'fosa/new',
// 		children: sectionRoutes,
// 		data: { form: 'fosa', model: FosaFormDefinition },
// 		loadComponent: () => import('./pages/forms/form-page/form.page').then(m => m.FormPage),
// 		title: `fosa.form.page_title`
// 	},
// 	{
// 		path: 'csc/new',
// 		children: sectionRoutes,
// 		data: { form: 'csc', model: CscFormDefinition },
// 		loadComponent: () => import('./pages/forms/form-page/form.page').then(m => m.FormPage),
// 		title: `csc.form.page_title`
// 	},
// 	{
// 		path: 'chefferie/new',
// 		children: sectionRoutes,
// 		data: { form: 'chefferie', model: ChefferieFormDefinition },
// 		loadComponent: () => import('./pages/forms/form-page/form.page').then(m => m.FormPage),
// 		title: `chefferie.form.page_title`
// 	},
// 	{
// 		children: sectionRoutes,
// 		canDeactivate: [hasChangesGuard],
// 		data: { form: "fosa", model: FosaFormDefinition },
// 		path: "fosa/:submissionIndex",
// 		title: "fosa.form.page_title",
// 		loadComponent: () =>
// 			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
// 	},
// 	{
// 		children: sectionRoutes,
// 		canDeactivate: [hasChangesGuard],
// 		data: { form: "chefferie", model: ChefferieFormDefinition },
// 		path: "chefferie/:submissionIndex",
// 		title: "chefferie.form.page_title",
// 		loadComponent: () =>
// 			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
// 	},
// 	{
// 		children: sectionRoutes,
// 		canDeactivate: [hasChangesGuard],
// 		data: { form: "csc", model: CscFormDefinition },
// 		path: "csc/:submissionIndex",
// 		title: "csc.form.page_title",
// 		loadComponent: () =>
// 			import("./pages/forms/form-page/form.page").then((m) => m.FormPage),
// 	},
// ];
