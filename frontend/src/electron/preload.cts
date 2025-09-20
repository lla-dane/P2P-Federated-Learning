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

  // Window control APIs
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // App control API
  quitApp: () => ipcRenderer.send('app:quit'),
  
});
