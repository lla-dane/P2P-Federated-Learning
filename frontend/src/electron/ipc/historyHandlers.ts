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

  ipcMain.handle(
    'history:update',
    (_event, { projectId, newStatus, newWeightsHash }) => {
      const history = store.get('trainingHistory', []) as any[];

      const projectIndex = history.findIndex((p) => p.id === projectId);

      if (projectIndex !== -1) {
        if (newStatus) {
          history[projectIndex].status = newStatus;
        }

        if (newWeightsHash) {
          history[projectIndex].weightsHash = newWeightsHash;
        }

        store.set('trainingHistory', history);
        return true;
      }
      return false;
    }
  );
}
