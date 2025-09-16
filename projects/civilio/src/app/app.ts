import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseLayout } from './layouts/base/base.layout';
import { FormService } from './services/form.service';
@Component({
  selector: 'cv-root',
  imports: [RouterOutlet, BaseLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('civilio');
  protected formService = inject(FormService);
  ngOnInit(): void {

  }
}
