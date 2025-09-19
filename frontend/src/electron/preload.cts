import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
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
  saveCredentials: (settings: object) =>
    ipcRenderer.invoke('credentials:save', settings),
  loadCredentials: () => ipcRenderer.invoke('credentials:load'),
  getHistory: () => ipcRenderer.invoke('history:get'),
  addHistory: (projectData: object) =>
    ipcRenderer.invoke('history:add', projectData),
  onProgress: (callback: (msg: string) => void) => {
    ipcRenderer.on('pinata:progress', (_, msg) => callback(msg));
  },
});
