import { Routes } from "@angular/router";

export const authRoutes: Routes = [
	{
		title: 'login.sign_in',
		path: 'login',
		loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	}
];
