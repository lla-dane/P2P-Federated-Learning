export interface ISettings {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
}

export interface IElectronAPI {
  openFileDialog: () => Promise<string | null>;
  onProgress: (callback: (message: string) => void) => void;
  saveCredentials: (settings: ISettings) => Promise<void>;
  loadCredentials: () => Promise<ISettings | null>;
  getHistory: () => Promise<any[]>;
  addHistory: (projectData: object) => Promise<void>;
  updateHistoryItem: (data: {
    projectId: string;
    newStatus?: string;
    newWeightsHash?: string;
  }) => Promise<void>;
  deleteHistoryItem: (projectId: string) => Promise<boolean>;
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
  uploadDatasetToAkave: (
    filePath: string
  ) => Promise<{ datasetHash: string; chunkCount: number }>;
  listFilesFromAkave: () => Promise<any[]>;
  fetchFileFromAkave: (objectKey: string) => Promise<string>;
  onAkaveProgress: (callback: (message: string) => void) => void;
  startLogSubscription: (data: { projectId: string; topicId: string }) => void;
  stopLogSubscription: () => void;
  getLogs: (projectId: string) => Promise<any[]>;
  onNewLog: (callback: (log: any) => void) => () => void;
  downloadFile: (data: {
    url: string;
    fileName: string;
  }) => Promise<{ success: boolean; path?: string; reason?: string }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
