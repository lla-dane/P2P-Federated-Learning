import { ipcMain } from 'electron';
import { AkaveCliService } from '../akaveCli.js';

const akaveService = new AkaveCliService();

export function registerAkaveHandlers() {
  ipcMain.handle(
    'akave:configure',
    (
      _event,
      {
        awsAccessKeyId,
        awsSecretAccessKey,
      }: { awsAccessKeyId: string; awsSecretAccessKey: string }
    ) => {
      return akaveService.configureAws(awsAccessKeyId, awsSecretAccessKey);
    }
  );

  ipcMain.handle('akave:uploadFile', (_event, filePath: string) => {
    return akaveService.uploadFile(filePath);
  });

  ipcMain.handle('akave:uploadDataset', (event, filePath: string) => {
    return akaveService.uploadDatasetInChunks(filePath, (message) => {
      event.sender.send('akave:progress', message);
    });
  });

  // Handler for listing all files in the bucket
  ipcMain.handle('akave:listFiles', () => {
    return akaveService.listFiles();
  });

  // Handler for fetching the content of a specific file by its key
  ipcMain.handle('akave:fetchFile', (_event, objectKey: string) => {
    return akaveService.fetchFile(objectKey);
  });
}
