import { ipcMain, dialog } from 'electron';

export function registerDialogHandlers() {
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({});
    if (!canceled && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });
}
