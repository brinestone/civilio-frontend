import { eq, queryOnce, WithoutVirtualProps, WithVirtualProps } from "@tanstack/db";
import omit from 'lodash/omit';
import { formItemsCollection } from "./collections";

export function removeVirtualProps<T extends object>(o: WithVirtualProps<T>) {
	return omit(o, ['$collectionId', '$synced', '$key', '$origin']) as WithoutVirtualProps<T>;
}

export async function findAllParentDataKeys(id: string): Promise<string[]> {
	const response = await queryOnce(q => q.from({ fi: formItemsCollection })
		.join(({ parent: formItemsCollection }), ({ fi, parent }) => eq(fi.parentId, parent.id))
		.where(({ fi }) => eq(fi.id, id))
		.select(({ parent }) => ({ dataKey: parent.config.dataKey }))
		.findOne()
	);

	if (!response || !response.dataKey) return Array<string>();

	return [response.dataKey, ...(await findAllParentDataKeys(response.dataKey))];
}
