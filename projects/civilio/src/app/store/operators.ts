export function deleteByKey<T extends object, K extends keyof T>(key: K) {
	return (v: T) => {
		if (!v) return v;

		const { [key]: valueToDelete, ...rest } = v;
		return rest as T;
	}
}
