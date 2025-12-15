import { Routes } from "@angular/router";

export const authRoutes: Routes = [
	{
		title: 'Sign in',
		path: 'login',
		loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	}
];
