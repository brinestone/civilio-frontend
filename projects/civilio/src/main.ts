import { bootstrapApplication } from '@angular/platform-browser';
import { enableArrayMethods, setAutoFreeze } from 'immer';
import { App } from './app/app';
import { appConfig } from './app/app.config';

enableArrayMethods();
setAutoFreeze(false);

bootstrapApplication(App, appConfig)
	.catch((err) => console.error(err));
