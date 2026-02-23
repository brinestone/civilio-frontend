import { assertInInjectionContext, inject, InjectionToken } from '@angular/core';

export * from './field-schema-designer/field-schema-designer';

export type FormItemContext = {
	itemDeleteHandler: (path: string, index: number) => void;
};

export const FormItemContextToken = new InjectionToken<FormItemContext>('forms.item.ctx');
export function injectFormItemContext() {
	assertInInjectionContext(injectFormItemContext);
	return inject(FormItemContextToken);
}