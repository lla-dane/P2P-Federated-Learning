import { ipcMain, BrowserWindow } from 'electron';
import { LogService } from '../logServices.js';
import Store from 'electron-store';

export function registerLogHandlers(
  mainWindow: BrowserWindow,
  logService: LogService,
  store: Store
) {
  ipcMain.on(
    'logs:start',
    (
      _event,
      { projectId, topicId }: { projectId: string; topicId: string }
    ) => {
      if (mainWindow) {
        logService.startSubscription(mainWindow, projectId, topicId);
      }
    }
  );

  ipcMain.on('logs:stop', () => {
    logService.stopSubscription();
  });
}
