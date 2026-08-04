import { inject } from "@angular/core";
import { RedirectCommand, ResolveFn, Router } from "@angular/router";
import { responseSessionsCollection } from "@db/collections";
import { and, eq, queryOnce } from "@tanstack/db";

export const submissionSessionResolver: ResolveFn<string | undefined> = async (route, state) => {
	const index = route.paramMap.get('index');
	if (index === 'new') return undefined;

	const id = route.queryParamMap.get('session');
	if (id && id !== 'current') return id as string;

	const formVersion = route.paramMap.get('version')!;
	const router = inject(Router);
	const result = await queryOnce(q => q.from({ session: responseSessionsCollection })
		.where(({ session }) => and(eq(session.formVersion, formVersion), eq(session.index, Number(index))))
		.orderBy(({ session }) => session.createdAt, { direction: 'desc' })
		.select(({ session }) => ({ id: session.id }))
		.findOne()
	);

	if (!result) {
		return undefined;
	}

	const base = 'http://localhost';
	const url = new URL(state.url, base);
	url.searchParams.set('session', result.id);
	const tree = router.parseUrl(url.toString().substring(base.length));

	return new RedirectCommand(tree, { replaceUrl: true });
};
