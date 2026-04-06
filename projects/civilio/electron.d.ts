declare global {
	interface Window {
		electron: {
			invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
			platform: 'aix'
			| 'darwin'
			| 'freebsd'
			| 'linux'
			| 'openbsd'
			| 'sunos'
			| 'win32',
			uploadFile: (options: { multiple?: true, filters: string[] }) => Promise<string | null>
		};
	}
}

export { };

