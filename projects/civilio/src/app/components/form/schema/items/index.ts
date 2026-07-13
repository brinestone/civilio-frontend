import { assertInInjectionContext, inject, InjectionToken, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { Strict } from '@civilio/shared';
import { FormItem, QuestionItem } from '@db/schemas';

export * from './field-item-designer/field-item-designer';

export type FormSchemaContext = {
	libraryToggleHandler: (itemId: string) => void;
	itemDeleteHandler: (id: string) => void;
	// selectionToggledHandler: (path: string, state: boolean) => void;
	allFields: Signal<Record<string, FieldTree<Strict<QuestionItem>>>>;
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
