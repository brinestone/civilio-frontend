import { assertInInjectionContext, inject, InjectionToken, Injector, OutputRef } from "@angular/core";

export interface Importer<T> {
	finished: OutputRef<T>;
}
export interface ImportContext<T> {
	onFinished: (result: T) => void;
}
const ImportContext = new InjectionToken<ImportContext<any>>('import.ctx');
export function injectImportContext<T>() {
	assertInInjectionContext(injectImportContext);
	return inject<ImportContext<T>>(ImportContext, { optional: true });
}
export function createImporterInjector<T>(onFinished: (result: T) => void) {
	assertInInjectionContext(createImporterInjector);
	const parentInjector = inject(Injector);
	return Injector.create({
		parent: parentInjector,
		providers: [
			{
				provide: ImportContext,
				useValue: { onFinished }
			}
		]
	})
}
