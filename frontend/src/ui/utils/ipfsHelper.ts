export const initializePinata = (jwt: string): Promise<void> => {
  return window.electronAPI.initializePinata(jwt);
};

export const uploadFile = (filePath: string): Promise<string> => {
  return window.electronAPI.uploadFile(filePath);
};

export const uploadDatasetInChunks = (filePath: string): Promise<string> => {
  return window.electronAPI.uploadDatasetInChunks(filePath);
};

export const listPinnedFiles = (): Promise<any[]> => {
  return window.electronAPI.listPinnedFiles();
};

export const fetchFile = (cid: string): Promise<string | null> => {
  return window.electronAPI.fetchFile(cid);
};

export const openFileDialog = (): Promise<string | null> => {
  return window.electronAPI.openFileDialog();
};

export const onProgress = (callback: (message: string) => void) => {
  window.electronAPI.onProgress(callback);
};
