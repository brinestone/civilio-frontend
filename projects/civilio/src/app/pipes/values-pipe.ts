import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'values'
})
export class ValuesPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown[] {
    if (Array.isArray(value)) return value;
    else if (typeof value == 'object') return Object.values(value as any);
    return [];
  }

}
