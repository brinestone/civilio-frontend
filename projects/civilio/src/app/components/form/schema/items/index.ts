import { assertInInjectionContext, inject, InjectionToken, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormItemEntity } from '@app/components/form/schema/form-designer-config';
import { Strict } from '@civilio/shared';
import { QuestionFormItem } from '@db/schemas';

export * from './field-item-schema-designer/field-item-schema-designer';

export type FormSchemaContext = {
	libraryToggleHandler: (itemId: string) => void;
	itemDeleteHandler: (id: string) => void;
	// selectionToggledHandler: (path: string, state: boolean) => void;
	allFields: Signal<Record<string, FieldTree<Strict<QuestionFormItem>>>>;
	// allItemsSelected: Signal<boolean>;
};
export type FormItemDesignerContext<T extends FormItemEntity> = {
	fieldTree: Signal<FieldTree<Strict<T>>>;
	index: Signal<number>;
	// selected: WritableSignal<boolean>;
};

const FormDesignerContextToken = new InjectionToken<FormSchemaContext>('forms.ctx');
const FormItemDesignerContextToken = new InjectionToken<FormItemDesignerContext<FormItemEntity>>('forms.item.ctx');

export function injectFormItemDesignerContext<T extends FormItemEntity>() {
	assertInInjectionContext(injectFormItemDesignerContext);
	return inject<FormItemDesignerContext<T>>(FormItemDesignerContextToken);
}

export function injectFormSchemaContext() {
	assertInInjectionContext(injectFormSchemaContext);
	return inject(FormDesignerContextToken);
}
export function createFormItemDesignerContextInjector<T extends FormItemEntity>(context: FormItemDesignerContext<T>, parentInjector?: Injector) {
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
