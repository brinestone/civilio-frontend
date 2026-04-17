import { assertInInjectionContext, inject, InjectionToken, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormItem } from '@app/components/form/schema/form-designer-config';
import { FormItemField, NewFormItemField } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { Observable } from 'rxjs';

export * from './field-item-schema-designer/field-item-schema-designer';

export type FormSchemaContext = {
	libraryToggleHandler: (itemId: string) => void;
	itemDeleteHandler: (path: string, index: number) => void;
	// selectionToggledHandler: (path: string, state: boolean) => void;
	allFields: Signal<Record<string, FieldTree<Strict<FormItemField | NewFormItemField>>>>;
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
