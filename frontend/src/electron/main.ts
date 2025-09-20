import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { isDev } from './utils.js';
import { resolvePath } from './pathResolver.js';
import * as PinataService from './ipfs.js';
import keytar from 'keytar';
import Store from 'electron-store';
import { registerIpcHandlers } from './ipc/index.js';

app.on('ready', () => {
  registerIpcHandlers();

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: resolvePath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
