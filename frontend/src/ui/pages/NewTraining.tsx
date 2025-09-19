import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { useSettings } from '../contexts/SettingsContext';
import {
  initializePinata,
  uploadDatasetInChunks,
  uploadFile,
  onProgress,
} from '../utils/ipfsHelper';
import { Loader2 } from 'lucide-react';

const NewTrainingPage = () => {
  const { settings, isConfigured } = useSettings();
  const [projectName, setProjectName] = useState('');
  const [datasetFile, setDatasetFile] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<{
    datasetHash?: string;
    modelHash?: string;
  } | null>(null);

  useEffect(() => {
    if (isConfigured) {
      initializePinata(settings.jwt);
    }

    onProgress((message) => {
      if (isLoading) {
        setStatusMessage(message);
      }
    });
  }, [settings, isConfigured, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !datasetFile || !modelFile) {
      alert(
        'Please fill out the project name and select both a dataset and a model file.'
      );
      return;
    }
    setIsLoading(true);
    setResult(null);
    setStatusMessage('Preparing to upload...');
    try {
      const datasetPath = datasetFile;
      const modelPath = modelFile;

      const datasetHash = await uploadDatasetInChunks(datasetPath);
      setStatusMessage('Uploading model file...');
      const modelHash = await uploadFile(modelPath);

      setStatusMessage('All files uploaded successfully!');
      setResult({ datasetHash, modelHash });
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className='text-center flex flex-col items-center justify-center h-full'>
        <h2 className='text-2xl font-bold text-text-primary mb-4'>
          Configuration Required
        </h2>
        <p className='text-text-secondary mb-6 max-w-md'>
          Please set your Pinata JWT in the settings page to enable IPFS file
          uploads.
        </p>
        <Link
          to='/settings'
          className='bg-primary text-background font-semibold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity'
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-text-primary mb-2'>
        Start a New Training Job
      </h1>
      <p className='text-text-secondary mb-8'>
        Upload your dataset and Python script to begin the training process.
      </p>
      <div className='max-w-3xl mx-auto bg-surface p-8 rounded-xl border border-border'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='projectName'
              className='block text-sm font-medium text-text-secondary mb-2'
            >
              Project Name
            </label>
            <input
              type='text'
              id='projectName'
              placeholder='e.g., Image Classification Model'
              className='w-full bg-background border border-border text-text-primary rounded-lg p-2.5 focus:ring-primary focus:border-primary'
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <FileUpload
            label='Dataset (.zip, .csv, etc.)'
            fileType='dataset'
            onFileSelect={setDatasetFile}
          />
          <FileUpload
            label='Python Script (.py)'
            fileType='Python script'
            onFileSelect={setModelFile}
          />

          <button
            type='submit'
            disabled={isLoading}
            className='w-full flex items-center justify-center bg-primary text-background font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading && <Loader2 className='mr-2 h-5 w-5 animate-spin' />}
            {isLoading ? 'Processing...' : 'Start Training'}
          </button>
        </form>
        {(isLoading || statusMessage) && (
          <div className='mt-6 text-center'>
            <p className='text-text-secondary text-sm'>{statusMessage}</p>
          </div>
        )}
        {result && (
          <div className='mt-6 p-4 bg-background rounded-lg text-text-primary text-sm font-mono break-all'>
            <p>
              <strong>✅ Success!</strong>
            </p>
            <p className='mt-2'>
              <strong>Dataset Manifest Hash:</strong> {result.datasetHash}
            </p>
            <p>
              <strong>Model Hash:</strong> {result.modelHash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTrainingPage;
