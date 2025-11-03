import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'replace'
})
export class ReplaceInStringPipe implements PipeTransform {

	transform(value: string = '', target: string, replacement: string): unknown {
		return value.replaceAll(target, replacement);
	}

}
