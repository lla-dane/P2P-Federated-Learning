export interface AkaveCredentials {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
}

/**
 * Configures the AWS CLI profile with Akave credentials.
 */
export const configureAkave = (creds: AkaveCredentials): Promise<boolean> => {
  return window.electronAPI.configureAkave(creds);
};

/**
 * Uploads a single file (e.g., model script) to Akave.
 * @returns The SHA256 object key.
 */
export const uploadFileToAkave = (filePath: string): Promise<string> => {
  return window.electronAPI.uploadFileToAkave(filePath);
};

/**
 * Uploads a large dataset to Akave using the chunking and manifest strategy.
 * @returns The SHA256 object key of the final manifest file.
 */
export const uploadDatasetToAkave = (
  filePath: string
): Promise<{ datasetHash: string; chunkCount: number }> => {
  return window.electronAPI.uploadDatasetToAkave(filePath);
};

/**
 * Lists all files in the Akave bucket.
 */
export const listFilesFromAkave = (): Promise<any[]> => {
  return window.electronAPI.listFilesFromAkave();
};

/**
 * Fetches the content of a file from Akave given its object key.
 */
export const fetchFileFromAkave = (objectKey: string): Promise<string> => {
  return window.electronAPI.fetchFileFromAkave(objectKey);
};

/**
 * Listens for real-time progress updates during a dataset upload.
 */
export const onAkaveProgress = (callback: (message: string) => void) => {
  window.electronAPI.onAkaveProgress(callback);
};
