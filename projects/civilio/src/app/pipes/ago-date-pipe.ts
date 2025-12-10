import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from 'date-fns/locale';


@Pipe({
	name: 'ago_date'
})
export class AgoDatePipePipe implements PipeTransform {

	transform(value: Date | null | undefined, locale: string = navigator.language.substring(0, 2) as any): string {
		if (value === null || value === undefined) return '';
		let _locale: any;
		switch (locale) {
			case 'en':
				_locale = enUS;
				break;
			default:
				_locale = fr;
		}
		return formatDistanceToNow(new Date(value.toLocaleString()), {
			locale: _locale,
			addSuffix: true
		});
	}
}
