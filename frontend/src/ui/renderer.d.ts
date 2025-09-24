export interface ISettings {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
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
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  quitApp: () => void;
  openExternalLink: (url: string) => void;
  configureAkave: (creds: {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
  }) => Promise<boolean>;
  uploadFileToAkave: (filePath: string) => Promise<string>;
  uploadDatasetToAkave: (filePath: string) => Promise<string>;
  listFilesFromAkave: () => Promise<any[]>;
  fetchFileFromAkave: (objectKey: string) => Promise<string>;
  onAkaveProgress: (callback: (message: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
