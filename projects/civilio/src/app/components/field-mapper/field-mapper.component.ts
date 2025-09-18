import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoadMappings } from '@app/store/form';
import { fieldMappingsfor } from '@app/store/selectors';
import { FormType } from '@civilio/shared';
import { dispatch, Store } from '@ngxs/store';

@Component({
  selector: 'cv-field-mapper',
  imports: [NgTemplateOutlet, ReactiveFormsModule],
  templateUrl: './field-mapper.component.html',
  styleUrl: './field-mapper.component.scss'
})
export class FieldMapperComponent {
  private store = inject(Store);
  private loadMappings = dispatch(LoadMappings);
  readonly form = input.required<FormType>();
  protected readonly mappings = computed(() => {
    return this.store.selectSnapshot(fieldMappingsfor(this.form()));
  });
  protected readonly sections = computed(() => {
    const form = this.form();
    switch (form) {
      case 'fosa':
        return [{ group: '' }]
    }
    return [];
  })
  protected readonly controls = new FormArray<FormControl<string | null>>([]);
  constructor() {
    effect(() => {
      this.loadMappings(this.form());
    });
    effect(() => {

    })
  }
}
