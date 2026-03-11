import { assertInInjectionContext, inject, InjectionToken, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormItemDefinition, FormItemField, NewFormItemDefinition } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';

export * from './field-schema-designer/field-schema-designer';

export type FormItem = FormItemDefinition | NewFormItemDefinition;
export type FormSchemaContext = {
	itemDeleteHandler: (path: string, index: number) => void;
	allFields: Signal<Record<string, FieldTree<Strict<FormItemField>>>>;
};
export type FormItemSchemaContext<T extends FormItem> = {
	fieldTree: Signal<FieldTree<Strict<T>>>;
	index: Signal<number>;
};

const FormSchemaContextToken = new InjectionToken<FormSchemaContext>('forms.ctx');
const FormItemSchemaContextToken = new InjectionToken<FormItemSchemaContext<FormItem>>('forms.item.ctx');

export function injectFormItemSchemaContext<T extends FormItem>() {
	assertInInjectionContext(injectFormItemSchemaContext);
	return inject<FormItemSchemaContext<T>>(FormItemSchemaContextToken);
}

export function injectFormSchemaContext() {
	assertInInjectionContext(injectFormSchemaContext);
	return inject(FormSchemaContextToken);
}
export function createFormItemSchemaContextInjector<T extends FormItem>(context: FormItemSchemaContext<T>, parentInjector?: Injector) {
	assertInInjectionContext(createFormSchemaContextInjector);
	const parent = parentInjector ?? inject(Injector);
	return Injector.create({
		parent,
		providers: [
			{ provide: FormItemSchemaContextToken, multi: false, useValue: context }
		]
	})
}
export function createFormSchemaContextInjector(context: FormSchemaContext, parentInjector?: Injector) {
	assertInInjectionContext(createFormSchemaContextInjector);
	const parent = parentInjector ?? inject(Injector);
	return Injector.create({
		parent,
		providers: [
			{
				provide: FormSchemaContextToken,
				multi: false,
				useValue: context
			}
		]
	})
}
