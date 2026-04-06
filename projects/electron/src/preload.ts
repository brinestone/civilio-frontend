import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electron', {
	// send: (channel: string, data: any) => {
	// 	ipcRenderer.send(channel, data);
	// },
	// on: (channel: string, func: (...args: any[]) => void) => {
	// 	const newFunc = (...args: any[]) => func(...args);
	// 	ipcRenderer.on(channel, newFunc);
	// },
	// sendSync: (channel: string, data: any) => {
	// 	return ipcRenderer.sendSync(channel, data);
	// },
	// off: (channel: string, func: (...args: any[]) => void) => {
	// 	ipcRenderer.removeListener(channel, func);
	// },
	invoke: <T>(channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args) as Promise<T>,
	platform: process.platform,
	uploadFile: (options: { multiple?: true, filters: string[] }) => ipcRenderer.invoke('upload-file', options)
});
