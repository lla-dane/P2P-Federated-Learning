import { ipcMain } from 'electron';
import keytar from 'keytar';

const SERVICE_NAME = 'AWS';
const ACCOUNT_NAME = 'AWSAPIKey';

export function registerCredentialHandlers() {
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
}
