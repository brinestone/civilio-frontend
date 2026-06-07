import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'compact',
})
export class CompactNumberPipe implements PipeTransform {
	transform(value?: string | number | null, display?: 'short' | 'long') {
		const parsed = Number(value);
		if (value === null || isNaN(parsed)) return '';
		const formatter = new Intl.NumberFormat(undefined, { notation: 'compact', compactDisplay: display ?? 'short' })
		return formatter.format(parsed);
	}

}
