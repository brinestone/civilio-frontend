import { Pipe, PipeTransform } from '@angular/core';
import { differenceInDays, format, formatDistanceToNow, Locale } from "date-fns";
import { enUS, fr } from 'date-fns/locale';


@Pipe({
	name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {

	transform(value: Date | string | number | null | undefined, locale: string = navigator.language.substring(0, 2) as any): string {
		if (!value) return '';

		const date = new Date(value);
		let _locale: Locale;

		switch (locale) {
			case 'en':
				_locale = enUS;
				break;
			default:
				_locale = fr;
		}

		// Calculate absolute difference in days
		const daysDifference = Math.abs(differenceInDays(new Date(), date));

		// If older than 7 days, show the actual formatted date
		if (daysDifference > 7) {
			const pattern = locale === 'en' ? 'MMM d, yyyy' : 'd MMM yyyy'; // e.g., "Jun 7, 2026" vs "7 juin 2026"
			return format(date, pattern, { locale: _locale });
		}

		// Otherwise, show relative time
		return formatDistanceToNow(date, {
			locale: _locale,
			addSuffix: true,
		});
	}
}
