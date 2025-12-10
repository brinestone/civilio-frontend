import { contextBridge, ipcRenderer, shell } from "electron";

contextBridge.exposeInMainWorld('electron', {
	send: (channel: string, data: any) => {
		ipcRenderer.send(channel, data);
	},
	on: (channel: string, func: (...args: any[]) => void) => {
		const newFunc = (...args: any[]) => func(...args);
		ipcRenderer.on(channel, newFunc);
	},
	sendSync: (channel: string, data: any) => {
		return ipcRenderer.sendSync(channel, data);
	},
	off: (channel: string, func: (...args: any[]) => void) => {
		ipcRenderer.removeListener(channel, func);
	},
	openExternalLink: (link: string) => {
		shell.openExternal(link);
	}
});
