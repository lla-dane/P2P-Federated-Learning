import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Pinata/IPFS related APIs
  initializePinata: (jwt: string) => ipcRenderer.invoke('pinata:init', jwt),
  uploadFile: (filePath: string) =>
    ipcRenderer.invoke('pinata:uploadFile', filePath),
  uploadDatasetInChunks: (filePath: string) =>
    ipcRenderer.invoke('pinata:uploadDataset', filePath),
  listPinnedFiles: () => ipcRenderer.invoke('pinata:list'),
  fetchFile: (cid: string) => ipcRenderer.invoke('pinata:fetch', cid),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  onIpfsProgress: (callback: (message: string) => void) => {
    ipcRenderer.on('ipfs:progress', (_event, message) => callback(message));
  },
  onProgress: (callback: (msg: string) => void) => {
    ipcRenderer.on('pinata:progress', (_, msg) => callback(msg));
  },

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
});
