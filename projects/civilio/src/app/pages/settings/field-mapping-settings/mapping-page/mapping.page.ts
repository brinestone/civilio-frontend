import { Component, computed } from '@angular/core';
import { FieldMapperComponent } from '@app/components';
import { FormSchema } from '@app/model/form';
import { FormType } from '@civilio/shared';
import { injectRouteData } from 'ngxtension/inject-route-data';

@Component({
	selector: 'cv-fosa',
	imports: [FieldMapperComponent],
	templateUrl: './mapping.page.html',
	styleUrl: './mapping.page.scss'
})
export class MappingPage {
	private readonly data = injectRouteData();
	protected readonly formModel = computed(() => this.data()['model'] as FormSchema);
	protected readonly form = computed(() => this.data()['form'] as FormType);

}
