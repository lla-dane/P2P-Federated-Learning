import { ipcMain } from 'electron';
import Store from 'electron-store';

const store = new Store();

export function registerHistoryHandlers() {
  ipcMain.handle('history:get', () => {
    return store.get('trainingHistory', []);
  });

  ipcMain.handle('history:add', (_event, projectData) => {
    const history = store.get('trainingHistory', []) as any[];
    history.unshift(projectData);
    store.set('trainingHistory', history);
  });
}
