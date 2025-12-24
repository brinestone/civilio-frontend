import { Pipe, PipeTransform } from "@angular/core";
import { first, last } from "lodash";

@Pipe({
	name: 'initials'
})
export class InitialsPipe implements PipeTransform {
	transform(value?: string, separator = ' ') {
		const list = value?.split(separator)
		if (!list) return '';

		return [(first(list)?.[0] ?? '').trim(), (last(list)?.[0] ?? '').trim()].join('');
	}
}
