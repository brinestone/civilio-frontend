import { app, BrowserWindow, nativeTheme } from "electron";
import { getAppConfig } from "./handlers";
import { registerPullHandlers, startServiceMonitoring } from './helpers/handlers';
import { showMainWindow } from "./helpers/windows";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

function applyPreferences() {
	const config = getAppConfig();

	// Apply theme
	nativeTheme.themeSource = config.prefs?.theme ?? 'system';
}

async function initializeServices() {
	registerPullHandlers();
	applyPreferences();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
	await initializeServices();
	const window = showMainWindow();
	startServiceMonitoring(window);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		showMainWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
