import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormService } from './services/form.service';
import { dispatch } from '@ngxs/store';
@Component({
  selector: 'cv-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('civilio');
  protected formService = inject(FormService);
  ngOnInit(): void {

  }
}
