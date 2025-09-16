import { app, BrowserWindow } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null;
export function showMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    center: true,
    width: 840,
    webPreferences: {
      devTools: !app.isPackaged,
      preload: path.resolve(path.join(__dirname, '..', 'preload.js'))
    }
  });

  if (['linux', 'win32'].includes(process.platform)) {
    mainWindow.removeMenu();
  }

  const startURL = app.isPackaged ? `file://${path.resolve(path.join(__dirname, '..', 'civilio', 'browser', 'index.html'))}` : `http://localhost:4200`;
  mainWindow.loadURL(startURL);
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();
  }
};
