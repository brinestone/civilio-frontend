import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { injectRouteData } from 'ngxtension/inject-route-data';

@Component({
  selector: 'cv-section-page',
  imports: [
		JsonPipe,
		CdkScrollableModule
	],
  templateUrl: './section-page.page.html',
  styleUrl: './section-page.page.scss'
})
export class SectionPagePage {
	protected readonly data = injectRouteData();
}
