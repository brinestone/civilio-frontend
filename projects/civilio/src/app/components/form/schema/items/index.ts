import { assertInInjectionContext, inject, InjectionToken, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormItemField } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';

export * from './field-schema-designer/field-schema-designer';

export type FormItemContext = {
	itemDeleteHandler: (path: string, index: number) => void;
	allFields: Signal<Record<string, FieldTree<Strict<FormItemField>>>>;
};

const FormItemContextToken = new InjectionToken<FormItemContext>('forms.item.ctx');
export function injectFormItemContext() {
	assertInInjectionContext(injectFormItemContext);
	return inject(FormItemContextToken);
}
export function createFormItemContextInjector(context: FormItemContext) {
	assertInInjectionContext(createFormItemContextInjector);
	const parent = inject(Injector);
	return Injector.create({
		parent,
		providers: [
			{
				provide: FormItemContextToken,
				multi: false,
				useValue: context
			}
		]
	})
}
