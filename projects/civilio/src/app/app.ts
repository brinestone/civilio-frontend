import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseLayout } from '@app/layouts/base/base.layout';
import { FormService } from '@app/services/form.service';
import { LoadConfig } from '@app/state/config';
import { isDesktop } from '@app/util';
import { dispatch } from '@ngxs/store';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'cv-root',
  imports: [RouterOutlet, BaseLayout, HlmToaster],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('civilio');
  protected formService = inject(FormService);
  private loadConfig = dispatch(LoadConfig);

  constructor(ts: ThemeService) {
    ts.theme$.subscribe(v => {
    });
  }

  ngOnInit(): void {
    if (isDesktop()) {
      this.loadConfig();
    }
  }
}
