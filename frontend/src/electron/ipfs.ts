import axios, { type AxiosInstance } from 'axios';
import fs from 'fs';
import readline from 'readline';
import FormData from 'form-data';

let apiClient: AxiosInstance;
let pinataGateway: string;

export const initializePinata = (jwt: string) => {
  apiClient = axios.create({
    baseURL: 'https://api.pinata.cloud',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  pinataGateway = 'gateway.pinata.cloud';
};

/**
 * Uploads a file stream to Pinata using Axios.
 * This is a non-blocking, memory-efficient approach.
 */
export const uploadFileToIpfs = async (filePath: string): Promise<string> => {
  if (!apiClient)
    throw new Error('Pinata not initialized. Please set JWT token.');

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream);

    const response = await apiClient.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw new Error(`Failed to upload file: ${error}`);
  }
};

/**
 * Uploads string content by wrapping it as a file buffer.
 */
const uploadStringToIpfs = async (
  content: string,
  name: string
): Promise<string> => {
  if (!apiClient)
    throw new Error('Pinata not initialized. Please set JWT token.');

  try {
    const formData = new FormData();
    formData.append('file', Buffer.from(content), name);

    const response = await apiClient.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Failed to upload string:', error);
    throw new Error(`Failed to upload string: ${error}`);
  }
};

/**
 * Dataset chunking and uploading logic (unchanged core logic).
 */
export const uploadDatasetInChunks = async (
  filePath: string,
  onProgress: (message: string) => void
): Promise<string> => {
  if (!apiClient)
    throw new Error('Pinata not initialized. Please set JWT token.');

  const CHUNK_SIZE = 50 * 1024; // 50KB
  const chunkHashes: string[] = [];

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentChunk: string[] = [];
  let currentSize = 0;
  let chunkIndex = 0;

  for await (const line of rl) {
    const lineWithNewline = line + '\n';
    const lineSize = Buffer.byteLength(lineWithNewline, 'utf-8');

    if (currentSize + lineSize > CHUNK_SIZE && currentChunk.length > 0) {
      chunkIndex++;
      onProgress(`Uploading chunk ${chunkIndex}...`);
      const chunkHash = await uploadStringToIpfs(
        currentChunk.join(''),
        `chunk-${chunkIndex}.txt`
      );
      chunkHashes.push(chunkHash);
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(lineWithNewline);
    currentSize += lineSize;
  }

  if (currentChunk.length > 0) {
    chunkIndex++;
    onProgress(`Uploading final chunk ${chunkIndex}...`);
    const chunkHash = await uploadStringToIpfs(
      currentChunk.join(''),
      `chunk-${chunkIndex}.txt`
    );
    chunkHashes.push(chunkHash);
  }

  onProgress('Uploading manifest file...');
  const manifestHash = await uploadStringToIpfs(
    chunkHashes.join(','),
    'manifest.txt'
  );
  onProgress(`Dataset uploaded successfully! Manifest Hash: ${manifestHash}`);
  return manifestHash;
};

/**
 * Fetches file content from the IPFS gateway using Axios.
 */
export const fetchFileFromIpfs = async (
  cid: string
): Promise<string | null> => {
  try {
    const url = `https://${pinataGateway}/ipfs/${cid}`;
    const response = await axios.get(url);
    // Normalize line endings
    return response.data.replace(/\r\n|\r/g, '\n');
  } catch (error) {
    console.error(`Failed to fetch file with CID ${cid}:`, error);
    return null;
  }
};

/**
 * Lists pinned files from your Pinata account using Axios.
 */
export const listPinnedFiles = async (): Promise<any[]> => {
  if (!apiClient)
    throw new Error('Pinata not initialized. Please set JWT token.');
  try {
    const response = await apiClient.get('/data/pinList');
    return response.data.rows || [];
  } catch (error) {
    console.error('Failed to list pinned files:', error);
    throw new Error(`Failed to list pinned files: ${error}`);
  }
};

export default {
  initializePinata,
  uploadFileToIpfs,
  uploadDatasetInChunks,
  fetchFileFromIpfs,
  listPinnedFiles,
};
