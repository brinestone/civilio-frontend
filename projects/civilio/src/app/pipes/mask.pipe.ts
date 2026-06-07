import { Pipe, PipeTransform } from '@angular/core';
import { maskString } from '@app/util';

@Pipe({
	name: 'mask'
})
export class MaskPipe implements PipeTransform {

	transform(value: string | null | undefined, maxCount = 3, sep = '.'): string {
		if (value === null || value === undefined) return ''
		return maskString(value, sep, maxCount);
	}

}
