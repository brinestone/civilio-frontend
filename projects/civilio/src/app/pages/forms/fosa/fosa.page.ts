import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, effect, inject, Injector, linkedSignal, resource, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormRecord, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { FosaFormDefinition } from '@app/model';
import { FORM_SERVICE } from '@app/services/form';
import { LoadOptions, UpdateMappings } from '@app/store/form';
import { Actions, dispatch, ofActionSuccessful } from '@ngxs/store';

import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';

import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';

import { NgTemplateOutlet } from '@angular/common';
import { FieldKey } from '@civilio/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { toast } from 'ngx-sonner';
import { injectParams } from 'ngxtension/inject-params';
import { injectRouteFragment } from 'ngxtension/inject-route-fragment';
import { AbstractForm } from '../form.page';

@Component({
  selector: 'cv-fosa',
  imports: [
    HlmTabsImports,
    TranslatePipe,
    NgTemplateOutlet,
    HlmDatePickerImports,
    HlmInput,
    HlmCheckboxImports,
    HlmLabel,
    ReactiveFormsModule,
    BrnTabsImports
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fosa.page.html',
  styleUrl: './fosa.page.scss'
})
export class FosaPage extends AbstractForm implements AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private loadOptions = dispatch(LoadOptions);
  private readonly targetTab = injectRouteFragment()
  private formService = inject(FORM_SERVICE);
  protected readonly submissionIndex = injectParams('submissionIndex');
  protected readonly injector = inject(Injector);
  protected destroyRef = inject(DestroyRef);

  protected irrelevant = signal<FieldKey[]>([]);
  protected formModel = FosaFormDefinition;
  protected currentTab = linkedSignal(() => {
    return this.targetTab() ?? this.formModel.sections[0].id;
  })
  protected readonly submissionData = resource({
    defaultValue: {},
    params: () => ({ index: this.submissionIndex() }),
    loader: async ({ params: { index } }) => {
      if (index === null) return {};
      return await this.formService.findSubmissionData('fosa', Number(index));
    }
  });
  protected readonly form = new FormRecord<UntypedFormControl>({});

  constructor(actions: Actions) {
    super();
    effect(() => {
      const err = this.submissionData.error();
      if (!err) return;
      const { message } = err;
      toast.error('Could not retrieve submission data', { description: message })
    });

    actions.pipe(
      takeUntilDestroyed(),
      ofActionSuccessful(UpdateMappings)
    ).subscribe(() => this.submissionData.reload());
  }

  ngAfterViewInit(): void {
    this.loadOptions('fosa');
    setTimeout(() => {
      this.prepareFormControls();
      this.cdr.markForCheck();
    }, 10);
  }
}
