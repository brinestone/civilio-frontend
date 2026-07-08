import { WithoutVirtualProps, WithVirtualProps } from "@tanstack/db";
import omit from 'lodash/omit';

export function removeVirtualProps<T extends object>(o: WithVirtualProps<T>) {
	return omit(o, ['$collectionId', '$synced', '$key', '$origin']) as WithoutVirtualProps<T>;
}
