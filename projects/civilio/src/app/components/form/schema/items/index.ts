import { assertInInjectionContext, inject, InjectionToken, Injector, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormItemDefinition, FormItemField, NewFormItemDefinition } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';

export * from './field-schema-designer/field-schema-designer';

export type FormItem = FormItemDefinition | NewFormItemDefinition;
export type FormSchemaContext = {
	itemDeleteHandler: (path: string, index: number) => void;
	// selectionToggledHandler: (path: string, state: boolean) => void;
	allFields: Signal<Record<string, FieldTree<Strict<FormItemField>>>>;
	// allItemsSelected: Signal<boolean>;
};
export type FormItemDesignerContext<T extends FormItem> = {
	fieldTree: Signal<FieldTree<Strict<T>>>;
	index: Signal<number>;
	// selected: WritableSignal<boolean>;
};

const FormDesignerContextToken = new InjectionToken<FormSchemaContext>('forms.ctx');
const FormItemDesignerContextToken = new InjectionToken<FormItemDesignerContext<FormItem>>('forms.item.ctx');

export function injectFormItemDesignerContext<T extends FormItem>() {
	assertInInjectionContext(injectFormItemDesignerContext);
	return inject<FormItemDesignerContext<T>>(FormItemDesignerContextToken);
}

export function injectFormSchemaContext() {
	assertInInjectionContext(injectFormSchemaContext);
	return inject(FormDesignerContextToken);
}
export function createFormItemDesignerContextInjector<T extends FormItem>(context: FormItemDesignerContext<T>, parentInjector?: Injector) {
	assertInInjectionContext(createFormSchemaContextInjector);
	const parent = parentInjector ?? inject(Injector);
	return Injector.create({
		parent,
		providers: [
			{ provide: FormItemDesignerContextToken, multi: false, useValue: context }
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
				provide: FormDesignerContextToken,
				multi: false,
				useValue: context
			}
		]
	})
}
