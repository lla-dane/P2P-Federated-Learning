import { ipcMain } from 'electron';
import * as PinataService from '../ipfs.js';

export function registerPinataHandlers() {
  ipcMain.handle('pinata:init', async (_event, jwt) => {
    return PinataService.initializePinata(jwt);
  });

  ipcMain.handle('pinata:uploadFile', async (_event, filePath) => {
    return await PinataService.uploadFileToIpfs(filePath);
  });

  ipcMain.handle('pinata:uploadDataset', async (event, filePath) => {
    return await PinataService.uploadDatasetInChunks(filePath, (msg) => {
      event.sender.send('pinata:progress', msg);
    });
  });

  ipcMain.handle('pinata:list', async () => {
    return await PinataService.listPinnedFiles();
  });

  ipcMain.handle('pinata:fetch', async (_event, cid) => {
    return await PinataService.fetchFileFromIpfs(cid);
  });
}
