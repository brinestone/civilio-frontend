/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { enableArrayMethods } from 'immer';
import { App } from './app/app';
import { appConfig } from './app/app.config';

enableArrayMethods();

bootstrapApplication(App, appConfig)
	.catch((err) => console.error(err));
