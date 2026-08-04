import { inject } from "@angular/core";
import { RedirectCommand, ResolveFn, Router } from "@angular/router";
import { formVersionsCollection } from "@db/collections";
import { and, eq, queryOnce } from "@tanstack/db";

export const formVersionResolver: ResolveFn<string> = async (route, state) => {
	const id = route.paramMap.get('version');
	if (id !== 'current') return id as string;

	const slug = route.paramMap.get('slug')!;
	const router = inject(Router);
	const result = await queryOnce(q => q.from({ fv: formVersionsCollection })
		.where(({ fv }) => and(eq(fv.form, slug), fv.isCurrent))
		.select(({ fv }) => ({ id: fv.id }))
		.findOne()
	);

	if (!result) {
		const tree = router.parseUrl('/forms')
		return new RedirectCommand(tree, { skipLocationChange: true });
	}

	const tree = router.parseUrl(state.url.replace('current', result.id));
	return new RedirectCommand(tree, { replaceUrl: true });
};
