import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideUnlink } from '@ng-icons/lucide';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';

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
    HlmSheetImports,
    BrnSheetImports
],
  templateUrl: './form.layout.html',
  styleUrl: './form.layout.scss'
})
export class FormLayout {

}
