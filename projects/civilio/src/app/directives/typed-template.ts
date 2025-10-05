import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[cvTypedTemplate]'
})
export class TypedTemplate<T> {
  typedTemplate = input<T>();
  constructor(private contentTemplate: TemplateRef<T>) {
  }
  static ngTemplateContextGuard<T>(dir: TypedTemplate<T>, ctx: unknown): ctx is T {
    return true;
  }

}
