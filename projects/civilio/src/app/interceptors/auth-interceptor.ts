import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { apiBaseUrl } from '@app/store/selectors';
import { Store } from '@ngxs/store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const store = inject(Store);
	const apiUrl = store.selectSnapshot(apiBaseUrl);
	if (apiUrl && req.url.startsWith(apiUrl)) {
		return next(req.clone({ withCredentials: true }));
	}
	return next(req);
};
