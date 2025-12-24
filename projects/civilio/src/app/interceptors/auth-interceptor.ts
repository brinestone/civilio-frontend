import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoggedOut } from '@app/store/auth';
import { apiBaseUrl } from '@app/store/selectors';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const store = inject(Store);
	const ts = inject(TranslateService);
	const apiUrl = store.selectSnapshot(apiBaseUrl);
	if (apiUrl && req.url.startsWith(apiUrl)) {
		return next(req.clone({ withCredentials: true })).pipe(
			catchError((e: HttpErrorResponse) => {
				if (e.status == 401) {
					store.dispatch(LoggedOut);
					return throwError(() => new Error(ts.instant(`http._${e.status}`)))
				}
				return throwError(() => e.error ?? e);
			})
		);
	}
	return next(req);
};
