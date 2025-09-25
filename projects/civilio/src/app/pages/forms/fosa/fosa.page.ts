import { Component, inject } from '@angular/core';
import { FormService } from '@app/services/form.service';

@Component({
  selector: 'cv-fosa',
  imports: [],
  templateUrl: './fosa.page.html',
  styleUrl: './fosa.page.scss'
})
export class FosaPage {
  private formService = inject(FormService);

}
