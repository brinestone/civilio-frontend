import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { apiOrigin } from "@app/store/selectors";
import { Store } from "@ngxs/store";

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
	const store = inject(Store);
	const origin = store.selectSnapshot(apiOrigin);
	const fullReq = req.clone({
		url: new URL(req.url, origin).toString(),
	});
	return next(fullReq);
};
