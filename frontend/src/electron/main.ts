import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { isDev } from './utils.js';
import { resolvePath } from './pathResolver.js';
import { registerIpcHandlers } from './ipc/index.js';
import { Client, TopicId, TopicMessageQuery } from '@hashgraph/sdk';
import { LogService } from './logServices.js';
import Store from 'electron-store';
import { registerLogHandlers } from './ipc/logHandlers.js';

let mainWindow: BrowserWindow;
const store = new Store();
const logService = new LogService();

ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

ipcMain.on('app:quit', () => {
  app.quit();
});

ipcMain.on('shell:openExternal', (_event, url: string) => {
  shell.openExternal(url);
});

app.on('ready', () => {
  registerIpcHandlers();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: resolvePath(),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }
  registerLogHandlers(mainWindow, logService, store);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
