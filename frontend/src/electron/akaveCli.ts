import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import readline from 'readline';

export class AkaveCliService {
  private readonly profile = 'akave-o3';
  private readonly endpointUrl = 'https://o3-rc2.akave.xyz';
  private readonly bucketName = 'akave-bucket';

  public async configureAws(
    accessKey: string,
    secretKey: string
  ): Promise<boolean> {
    console.log(`Configuring AWS profile '${this.profile}'...`);
    try {
      const command = [
        `aws configure set aws_access_key_id ${accessKey} --profile ${this.profile}`,
        `aws configure set aws_secret_access_key ${secretKey} --profile ${this.profile}`,
        `aws configure set region akave-network --profile ${this.profile}`,
        `aws configure set s3.request_checksum_calculation WHEN_REQUIRED --profile ${this.profile}`,
        `aws configure set s3.response_checksum_validation WHEN_REQUIRED --profile ${this.profile}`,
      ].join(' && ');

      await this.runCommand(command);

      console.log('AWS profile configured successfully with checksum fix!');
      return true;
    } catch (error) {
      console.error('Failed to configure AWS profile:', error);
      // Re-throw the error so it can be caught by the TrainingContext and shown in a toast
      throw error;
    }
  }

  private async getPresignedUrl(
    bucketName: string,
    objectKey: string,
    expiresInSeconds: number = 86400
  ): Promise<string> {
    const s3Uri = `s3://${bucketName}/${objectKey}`;
    const command = `aws s3 presign "${s3Uri}" --expires-in ${expiresInSeconds} --endpoint-url ${this.endpointUrl} --profile ${this.profile}`;
    const url = await this.runCommand(command);
    return url.trim(); // The CLI output can have a trailing newline
  }

  private async _internalUploadFile(
    bucketName: string,
    filePath: string
  ): Promise<string> {
    const objectKey = await this.sha256OfFile(filePath);
    const command = `aws s3api put-object --bucket ${bucketName} --key ${objectKey} --body "${filePath}" --endpoint-url ${this.endpointUrl} --profile ${this.profile}`;
    await this.runCommand(command);
    return objectKey;
  }

  private runCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr));
        else resolve(stdout);
      });
    });
  }

  private sha256OfFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  public async uploadFile(filePath: string): Promise<string> {
    const objectKey = await this._internalUploadFile(this.bucketName, filePath);
    return this.getPresignedUrl(this.bucketName, objectKey);
  }

  private async uploadString(content: string): Promise<string> {
    const tempFilePath = path.join(
      os.tmpdir(),
      `akave-chunk-${crypto.randomBytes(16).toString('hex')}`
    );
    try {
      await fs.promises.writeFile(tempFilePath, content, 'utf8');
      return await this._internalUploadFile(this.bucketName, tempFilePath);
    } finally {
      await fs.promises.unlink(tempFilePath);
    }
  }

  public async uploadDatasetInChunks(
    filePath: string,
    onProgress: (message: string) => void
  ): Promise<{ datasetHash: string; chunkCount: number }> {
    try {
      await this.runCommand(
        `aws s3api create-bucket --bucket ${this.bucketName} --endpoint-url ${this.endpointUrl} --profile ${this.profile}`
      );
      onProgress(`Bucket '${this.bucketName}' created for you.`);
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.includes('BucketAlreadyOwnedByYou') &&
        !error.message.includes('BucketAlreadyExists')
      ) {
        throw error;
      }
      onProgress(`Using existing bucket '${this.bucketName}'.`);
    }

    const CHUNK_SIZE = 50 * 1024;
    const chunkUrls: string[] = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    const iterator = rl[Symbol.asyncIterator]();
    const headerResult = await iterator.next();
    if (headerResult.done) {
      throw new Error('Cannot process an empty or headerless file.');
    }
    const header = headerResult.value + '\n';

    let currentChunk: string[] = [],
      currentSize = 0,
      chunkIndex = 0;

    for await (const line of { [Symbol.asyncIterator]: () => iterator }) {
      const lineWithNewline = line + '\n';
      const lineSize = Buffer.byteLength(lineWithNewline, 'utf-8');

      if (currentSize + lineSize > CHUNK_SIZE && currentChunk.length > 0) {
        chunkIndex++;
        onProgress(`Uploading chunk ${chunkIndex}...`);

        // 3. Prepend header before creating content and uploading
        const chunkContent = header + currentChunk.join('');
        const chunkKey = await this.uploadString(chunkContent);
        const chunkUrl = await this.getPresignedUrl(this.bucketName, chunkKey);
        chunkUrls.push(chunkUrl);

        currentChunk = [lineWithNewline];
        currentSize = lineSize;
      } else {
        currentChunk.push(lineWithNewline);
        currentSize += lineSize;
      }
    }
    if (currentChunk.length > 0) {
      chunkIndex++;
      onProgress(`Uploading final chunk ${chunkIndex}...`);
      const chunkContent = header + currentChunk.join('');
      const chunkKey = await this.uploadString(chunkContent);
      const chunkUrl = await this.getPresignedUrl(this.bucketName, chunkKey);
      chunkUrls.push(chunkUrl);
    }

    onProgress('Uploading manifest file...');
    const manifestContent = chunkUrls.join(',');
    const manifestKey = await this.uploadString(manifestContent);
    onProgress(`Dataset uploaded successfully!`);

    const datasetHash = await this.getPresignedUrl(
      this.bucketName,
      manifestKey
    );

    return { datasetHash, chunkCount: chunkUrls.length };
  }

  public async listFiles(): Promise<any[]> {
    const command = `aws s3api list-objects-v2 --bucket ${this.bucketName} --endpoint-url ${this.endpointUrl} --profile ${this.profile}`;
    const stdout = await this.runCommand(command);
    return JSON.parse(stdout).Contents || [];
  }

  public async fetchFile(objectKey: string): Promise<string> {
    const tempFilePath = path.join(os.tmpdir(), objectKey);
    const command = `aws s3api get-object --bucket ${this.bucketName} --key ${objectKey} "${tempFilePath}" --endpoint-url ${this.endpointUrl} --profile ${this.profile}`;
    try {
      await this.runCommand(command);
      return await fs.promises.readFile(tempFilePath, 'utf8');
    } finally {
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath);
      }
    }
  }
}
