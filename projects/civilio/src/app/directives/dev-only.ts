import { Directive, ElementRef, isDevMode, Optional, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[cvDevOnly]',
})
export class DevOnly {

	constructor(viewContainer: ViewContainerRef, @Optional() elr?: ElementRef<HTMLElement>, @Optional() templateRef?: TemplateRef<any>) {
		if (!elr && !templateRef) return;

		if (isDevMode()) {
			if (templateRef) {
				viewContainer.createEmbeddedView(templateRef);
			}
		} else {
			elr?.nativeElement.remove();
			viewContainer?.clear();
		}
	}

}
