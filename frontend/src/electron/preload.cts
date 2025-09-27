import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  downloadFile: (data: { url: string; fileName: string }) =>
    ipcRenderer.invoke('download:file', data),
  // Credential related APIs
  saveCredentials: (settings: object) =>
    ipcRenderer.invoke('credentials:save', settings),
  loadCredentials: () => ipcRenderer.invoke('credentials:load'),

  // History related APIs
  getHistory: () => ipcRenderer.invoke('history:get'),
  addHistory: (projectData: object) =>
    ipcRenderer.invoke('history:add', projectData),
  updateHistoryItem: (data: {
    projectId: string;
    newStatus?: string;
    newWeightsHash?: string;
  }) => ipcRenderer.invoke('history:update', data),
  deleteHistoryItem: (projectId: string) =>
    ipcRenderer.invoke('history:delete', projectId),

  // Window control APIs
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // App control API
  quitApp: () => ipcRenderer.send('app:quit'),

  // Open external links
  openExternalLink: (url: string) =>
    ipcRenderer.send('shell:openExternal', url),

  // Akave related APIs
  configureAkave: (creds: {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
  }) => ipcRenderer.invoke('akave:configure', creds),
  uploadFileToAkave: (filePath: string) =>
    ipcRenderer.invoke('akave:uploadFile', filePath),
  uploadDatasetToAkave: (filePath: string) =>
    ipcRenderer.invoke('akave:uploadDataset', filePath),
  listFilesFromAkave: () => ipcRenderer.invoke('akave:listFiles'),
  fetchFileFromAkave: (objectKey: string) =>
    ipcRenderer.invoke('akave:fetchFile', objectKey),
  onAkaveProgress: (callback: (message: string) => void) => {
    ipcRenderer.on('akave:progress', (_event, message) => callback(message));
  },

  // HCS related APIs
  startLogSubscription: (data: { projectId: string; topicId: string }) =>
    ipcRenderer.send('logs:start', data),

  stopLogSubscription: () => ipcRenderer.send('logs:stop'),

  getLogs: (projectId: string) => ipcRenderer.invoke('logs:get', projectId),

  onNewLog: (callback: (log: any) => void) => {
    const subscription = (_event: any, log: any) => callback(log);
    ipcRenderer.on('hcs:new-log', subscription);

    return () => ipcRenderer.removeListener('hcs:new-log', subscription);
  },
});
