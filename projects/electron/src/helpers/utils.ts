export async function pause(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}
