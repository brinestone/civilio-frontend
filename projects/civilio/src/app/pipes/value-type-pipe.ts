import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'valuetype'
})
export class ValueTypePipe implements PipeTransform {
	transform(value: any) {
		return typeof value;
	}
}
