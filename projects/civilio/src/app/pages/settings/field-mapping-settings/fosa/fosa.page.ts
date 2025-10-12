import { Component } from '@angular/core';
import { FieldMapperComponent } from '@app/components';
import { FosaFormDefinition } from '@app/model';

@Component({
  selector: 'cv-fosa',
  imports: [FieldMapperComponent],
  templateUrl: './fosa.page.html',
  styleUrl: './fosa.page.scss'
})
export class FosaPage {
  protected readonly definition = FosaFormDefinition;
}
