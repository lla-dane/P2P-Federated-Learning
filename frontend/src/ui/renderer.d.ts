interface ISettings {
  apiKey: string;
  apiSecret: string;
  jwt: string;
}

export interface IElectronAPI {
  initializePinata: (jwt: string) => Promise<void>;
  uploadFile: (filePath: string) => Promise<string>;
  uploadDatasetInChunks: (filePath: string) => Promise<string>;
  listPinnedFiles: () => Promise<any[]>;
  fetchFile: (cid: string) => Promise<string | null>;
  openFileDialog: () => Promise<string | null>;
  onProgress: (callback: (message: string) => void) => void;
  saveCredentials: (settings: ISettings) => Promise<void>;
  loadCredentials: () => Promise<ISettings | null>;
  getHistory: () => Promise<any[]>;
  addHistory: (projectData: object) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
