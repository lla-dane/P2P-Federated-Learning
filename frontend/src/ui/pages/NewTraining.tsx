import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTraining } from '../contexts/TrainingContext';

const NewTrainingPage = () => {
  const { isLoading, statusMessage, result, startTraining } = useTraining();
  const [projectName, setProjectName] = useState('');
  const [datasetFile, setDatasetFile] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !datasetFile || !modelFile) {
      toast.warning('All fields are required', {
        description:
          'Please provide a project name and select both a dataset and a model file.',
      });
      return;
    }
    await startTraining(projectName, datasetFile, modelFile);
  };

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
              className='w-full bg-background border border-border text-text-primary rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
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
            className='w-full flex items-center justify-center bg-primary text-background font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-text-primary'
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
