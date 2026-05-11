import { assertInInjectionContext, inject, InjectionToken, Injector, Signal } from "@angular/core";
import { FormItemDefinition } from "@civilio/sdk/models";

export type RenderedFormItemContext<TDefinition extends FormItemDefinition> = {
	definition: Signal<TDefinition>;
	// itemId: Signal<string>;
};

const RendererdFormItemContextToken = new InjectionToken<RenderedFormItemContext<any>>('rendererd-form-item-context');

export function createRenderedFormItemContextInjector(ctx: RenderedFormItemContext<FormItemDefinition>, parent?: Injector) {
	assertInInjectionContext(createRenderedFormItemContextInjector);
	return Injector.create({
		providers: [
			{ provide: RendererdFormItemContextToken, useValue: ctx, multi: false }
		],
		parent: parent ?? inject(Injector)
	});
}

export function injectRenderedFormItemContext<TDefinition extends FormItemDefinition>() {
	assertInInjectionContext(injectRenderedFormItemContext);
	return inject<RenderedFormItemContext<TDefinition>>(RendererdFormItemContextToken);
}

export type RenderedFieldContext = {
	// formControlName: Signal<string>;
	fieldId: Signal<string>;
};

const RenderedFieldContextToken = new InjectionToken<RenderedFieldContext>('rendered-field-item-context');
export function createRenderedFieldItemContextInjector(ctx: RenderedFieldContext, parent?: Injector) {
	assertInInjectionContext(createRenderedFieldItemContextInjector);
	return Injector.create({
		providers: [
			{ provide: RenderedFieldContextToken, useValue: ctx, multi: false }
		],
		parent: parent ?? inject(Injector)
	})
}

export function injectRenderedFieldContext<TValue>() {
	assertInInjectionContext(injectRenderedFieldContext);
	return inject<RenderedFieldContext>(RenderedFieldContextToken);
}
