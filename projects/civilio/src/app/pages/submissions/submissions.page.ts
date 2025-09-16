import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRefreshCw } from '@ng-icons/lucide';
import { FormType, FormTypeSchema } from '@civilio/shared';
import { createAngularTable, FlexRender, getCoreRowModel } from '@tanstack/angular-table'
import { HlmTableImports } from '@spartan-ng/helm/table';
import { FormService } from '../../services/form.service';

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
    HlmButton,
    FlexRender,
    HlmTableImports
  ],
  host: {
    'class': 'page'
  },
  templateUrl: './submissions.page.html',
  styleUrl: './submissions.page.scss'
})
export class SubmissionsPage {
  private formService = inject(FormService);
  protected readonly formTypeOptions = FormTypeSchema.options
  protected readonly formType = signal<FormType>('csc');
  protected submissions = rxResource({
    params: () => ({ form: this.formType() }),
    stream: ({ params: { form } }) => {
      return this.formService.findFormSubmissions(form, 0, 20, '')
    }
  });
  protected readonly table = createAngularTable(() => {
    return {
      data: this.submissions.value()?.data ?? [],
      columns: [{
        accessorKey: 'isValid',
        header: 'Is Valid',
      }],
      getCoreRowModel: getCoreRowModel()
    }
  })
}
