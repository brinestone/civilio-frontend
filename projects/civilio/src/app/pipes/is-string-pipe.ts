import { Pipe, PipeTransform } from '@angular/core';
import { isString } from 'lodash'

@Pipe({
	name: 'isString'
})
export class IsStringPipe implements PipeTransform {
	transform(value: any): any {
		return isString(value);
	}
}
