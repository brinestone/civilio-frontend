import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'clamp',
	standalone: true
})
export class ClampPipe implements PipeTransform {

	transform(value: string | number, min?: string | number, max?: string | number): number {
		const val = Number(value);
		const low = min !== undefined ? Number(min) : -Infinity;
		const high = max !== undefined ? Number(max) : Infinity;

		if (isNaN(val)) return 0;

		return Math.min(Math.max(val, low), high);
	}
}
