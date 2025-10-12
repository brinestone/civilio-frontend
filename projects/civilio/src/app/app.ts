import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { BaseLayout } from '@app/layouts/base/base.layout';
import { LoadConfig } from '@app/store/config';
import { isDesktop } from '@app/util';
import { dispatch } from '@ngxs/store';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { FORM_SERVICE } from './services/form';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'cv-root',
  imports: [RouterOutlet, BaseLayout, HlmToaster],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('civilio');
  protected formService = inject(FORM_SERVICE);
  private loadConfig = dispatch(LoadConfig);
  private themeService = inject(ThemeService);
  protected themeSignal = toSignal(this.themeService.theme$, { initialValue: 'system' });

  ngOnInit(): void {
    if (isDesktop()) {
      this.loadConfig();
    }
  }
}
