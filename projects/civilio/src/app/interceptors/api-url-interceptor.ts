import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { apiOrigin, machineId } from "@app/store/selectors";
import { Store } from "@ngxs/store";

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
	if (req.url.startsWith('/api')) {
		const store = inject(Store);
		const origin = store.selectSnapshot(apiOrigin);
		const mid = store.selectSnapshot(machineId);
		if (!origin) return next(req);
		const fullReq = req.clone({
			url: new URL(req.url, origin).toString(),
			setHeaders: {
				'Authorization': mid
			}
		});
		return next(fullReq);
	}
	return next(req);
};
