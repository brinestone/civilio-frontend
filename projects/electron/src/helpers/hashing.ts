import { createHash } from 'node:crypto';

export function hashThese(...values: string[]) {
	const cihper = createHash('md5');
	values.forEach(v => cihper.update(v));
	return cihper.digest('hex');
}
