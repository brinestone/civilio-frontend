import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TestDb } from '@app/store/config';
import { isActionLoading } from '@app/util';
import { TestDbConnectionRequestSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideDatabase, lucideSave, lucideServer } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmLabel } from '@spartan-ng/helm/label';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'cv-advanced-settings',
  viewProviders: [
    provideIcons({
      lucideDatabase,
      lucideCheck,
      lucideServer,
      lucideSave
    })
  ],
  imports: [
    NgIcon,
    HlmCheckbox,
    FormsModule,
    HlmLabel,
    HlmInput,
    HlmButton
  ],
  host: {
    'class': 'page'
  },
  templateUrl: './advanced-settings.page.html',
  styleUrl: './advanced-settings.page.scss'
})
export class AdvancedSettingsPage {
  protected readonly fieldSchema = [
    {
      label: 'Host',
      key: 'host',
      type: 'text',
      default: 'localhost',
      icon: 'lucideServer',
      hint: 'The database\'s hostname or IP address',
      required: true
    },
    {
      label: 'Port',
      key: 'port',
      type: 'number',
      required: true,
      default: 5432
    },
    {
      label: 'Database',
      key: 'database',
      type: 'text',
      default: 'postgres',
      required: true,
      hint: 'The name of the database to use'
    },
    {
      label: 'Username',
      key: 'username',
      default: 'postgres',
      type: 'text',
      icon: 'lucideUser',
      hint: 'The username to use to connect to the database server',
      required: true
    },
    {
      label: 'Password',
      key: 'password',
      type: 'password',
      hint: 'The password ot use to connect to the database server',
      required: true
    },
    {
      label: 'SSL',
      key: 'ssl',
      type: 'checkbox',
      required: false
    }
  ];
  protected readonly testingDbConnection = isActionLoading(TestDb);
  protected readonly dbConnectionPassed = signal(false);
  private readonly navigate = dispatch(Navigate);
  private readonly route = inject(ActivatedRoute).snapshot;
  private readonly testDb = dispatch(TestDb);
  protected onFormSubmit(form: NgForm) {
    console.log(form.value);
    const { database, host, password, port, ssl, username } = TestDbConnectionRequestSchema.parse(form.value);
    return this.testDb(host, port, database, username, password, ssl).subscribe({
      error: (e: Error) => {
        toast.error('Testing failed', { description: e.message });
      },
      complete: () => {
        toast.success('Changes saved');
        const redirect = this.route.queryParams['continue'];
        if (!redirect) return;
        this.navigate([decodeURIComponent(redirect)]);
      }
    })
  }
}
