import { Component, signal } from '@angular/core';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRefreshCw } from '@ng-icons/lucide';
import { FormType, FormTypeSchema } from '@civilio/shared';

@Component({
  selector: 'cv-submissions',
  viewProviders: [
    provideIcons({
      lucideRefreshCw
    })
  ],
  imports: [
    BrnSelectImports,
    NgIcon,
    HlmSelectImports,
    HlmButton
  ],
  host: {
    'class': 'page'
  },
  templateUrl: './submissions.page.html',
  styleUrl: './submissions.page.scss'
})
export class SubmissionsPage {
  protected readonly formTypeOptions = FormTypeSchema.options
  protected readonly formType = signal<FormType>('csc');
}
