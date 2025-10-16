import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'join'
})
export class JoinArrayPipe implements PipeTransform {

	transform(value: any[], separator: string): unknown {
		return value.join(separator);
	}

}
