import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideUnlink } from '@ng-icons/lucide';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

@Component({
  selector: 'cv-form',
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideUnlink
    })
  ],
  imports: [
    RouterOutlet,
    HlmAlertImports,
],
  templateUrl: './form.layout.html',
  styleUrl: './form.layout.scss',
	host: {
		class: 'scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent'
	}
})
export class FormLayout {

}
