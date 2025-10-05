import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';

export type Action = {
  key: string;
  label?: string;
  i18nKey?: string;
  icon?: string;
}

@Component({
  selector: 'cv-action-cell',
  imports: [
    NgIcon,
    HlmButton,
    TranslatePipe
  ],
  templateUrl: './action-cell.component.html',
  styleUrl: './action-cell.component.scss'
})
export class ActionCellComponent {
  readonly actions = input.required<Action[]>();
  readonly trigger = output<string>();
}
