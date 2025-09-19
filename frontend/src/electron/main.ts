import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { isDev } from './utils.js';
import { resolvePath } from './pathResolver.js';
import * as PinataService from './ipfs.js';
import keytar from 'keytar';

const SERVICE_NAME = 'Pinata';
const ACCOUNT_NAME = 'PinataAPIKey';

ipcMain.handle('credentials:save', async (_event, settings: object) => {
  const settingsString = JSON.stringify(settings);
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, settingsString);
});

ipcMain.handle('credentials:load', async () => {
  const settingsString = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  if (settingsString) {
    try {
      return JSON.parse(settingsString);
    } catch (error) {
      console.error('Failed to parse stored credentials:', error);
      return null;
    }
  }
  return null;
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled && filePaths.length > 0) {
    return filePaths[0];
  }
  return null;
});

// Initialize Pinata
ipcMain.handle('pinata:init', async (_event, jwt) => {
  return PinataService.initializePinata(jwt);
});

// Upload file
ipcMain.handle('pinata:uploadFile', async (_event, filePath) => {
  return await PinataService.uploadFileToIpfs(filePath);
});

// Upload dataset with progress updates
ipcMain.handle('pinata:uploadDataset', async (event, filePath) => {
  return await PinataService.uploadDatasetInChunks(filePath, (msg) => {
    event.sender.send('pinata:progress', msg);
  });
});

// List files
ipcMain.handle('pinata:list', async () => {
  return await PinataService.listPinnedFiles();
});

// Fetch file
ipcMain.handle('pinata:fetch', async (_event, cid) => {
  return await PinataService.fetchFileFromIpfs(cid);
});

app.on('ready', () => {
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
