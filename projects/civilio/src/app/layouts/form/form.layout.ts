import { Component, computed, DestroyRef, inject, model, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FieldMapperComponent } from "@app/components";
import { FormModelDefinition, FosaFormDefinition } from '@app/model';
import { FormType } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideUnlink } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButton } from '@spartan-ng/helm/button';
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
    NgIcon,
    HlmButton,
    RouterLinkActive,
    TranslatePipe,
    HlmAlertImports,
    RouterLink,
    HlmSheetImports,
    BrnSheetImports,
    FieldMapperComponent
  ],
  templateUrl: './form.layout.html',
  styleUrl: './form.layout.scss'
})
export class FormLayout implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  protected readonly index = model<number>();
  protected readonly model = model<FormModelDefinition>();
  protected readonly form = model<FormType>();
  protected readonly fragments = computed(() => {
    const model = this.model();
    const child = this.route.firstChild;
    if (!model || !child) return [];
    return model.sections.map(s => s.id);
    // const fragments = Array<{ id: string, depth: number }>();
    // for (const section of model.sections) {
    //   fragments.push(...extractKeys(section, 0));
    // }
    // return fragments;
  });
  ngOnInit(): void {
    const child = this.route.firstChild;
    if (child) {
      child.data.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(({ form }) => {
        this.form.set(form);
        switch (form) {
          case 'fosa':
            this.model.set(FosaFormDefinition);
            break;
        }
      });
      child.params.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(({ submissionIndex }) => {
        this.index.set(Number(submissionIndex));
      })
    }
  }
}
