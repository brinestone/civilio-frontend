import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, makeEnvironmentProviders } from "@angular/core";
import { toast } from "ngx-sonner";

@Injectable()
export class HttpClientErrorHandler implements ErrorHandler {
	handleError(error: any): void {
		if (error instanceof HttpErrorResponse) {
			const msg = error.error?.message ?? error.error ?? error.message;
			toast.error('An error occurred', { description: msg });
			return;
		}
		console.error(error);
	}
}

export function provideHttpClientErrorHandler() {
	return makeEnvironmentProviders([
		{ provide: ErrorHandler, useClass: HttpClientErrorHandler }
	]);
}
