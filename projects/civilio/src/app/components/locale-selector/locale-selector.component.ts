import { Component, linkedSignal } from '@angular/core';
import { SetLocale } from '@app/state/config';
import { currentLocale } from '@app/state/selectors';
import { NgIcon } from "@ng-icons/core";
import { dispatch, select } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'cv-locale-selector',
  imports: [
    BrnSelectImports,
    HlmSelectImports,
    NgIcon
  ],
  templateUrl: './locale-selector.component.html',
  styleUrl: './locale-selector.component.scss'
})
export class LocaleSelectorComponent {
  protected readonly setLocale = dispatch(SetLocale);
  protected readonly appliedLocale = select(currentLocale);
  protected readonly selectedLocale = linkedSignal(() => this.appliedLocale());
}
