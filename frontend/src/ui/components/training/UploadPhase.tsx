import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import { useTraining } from '../../contexts/TrainingContext';
import { Database, Shield, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { checkTaskStatus } from '../../utils/hederaHelper';
// import { subscription } from '../../utils/logsHelper';

export const UploadPhase = () => {
  const { uploadAssets, isLoading } = useTraining();
  const [projectName, setProjectName] = useState('');
  const [datasetFile, setDatasetFile] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<string | null>(null);
  const contractId = '0.0.6913120';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !datasetFile || !modelFile) {
      toast.warning('All fields are required');
      return;
    }
    // checkTaskStatus('52');
    // getEventsFromMirror(contractId);
    // fetchWeightsSubmittedEvent(contractId, '4');
    // subscription();
    uploadAssets(projectName, datasetFile, modelFile);
    // beginFinalTraining();
  };

  return (
    <div className='bg-surface p-8 rounded-xl border border-border'>
      <div className='flex items-center gap-3 mb-6'>
        <Database className='w-6 h-6 text-primary' />
        <h2 className='text-xl font-semibold text-text-primary'>
          Upload Your Training Assets
        </h2>
      </div>
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
            placeholder='e.g., Advanced Image Classification'
            className='w-full bg-background border border-border text-text-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50'
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className='grid md:grid-cols-2 gap-6'>
          <FileUpload
            label='Dataset (.csv)'
            fileType='dataset'
            onFileSelect={setDatasetFile}
          />
          <FileUpload
            label='Training Script (.py)'
            fileType='Python script'
            onFileSelect={setModelFile}
          />
        </div>
        <div className='p-4 bg-primary/10 border border-primary/20 rounded-lg'>
          <h3 className='font-medium text-text-primary mb-2 flex items-center gap-2'>
            <Shield className='w-4 h-4 text-primary' />
            What happens next?
          </h3>
          <ul className='text-sm text-text-secondary space-y-1 list-disc list-inside'>
            <li>
              Files will be uploaded to <strong>Akave network</strong> for
              secure storage.
            </li>
            <li>
              You will then be prompted for <strong>payment on Hedera</strong>{' '}
              to start the training round.
            </li>
          </ul>
        </div>
        <button
          type='submit'
          disabled={isLoading || !datasetFile || !modelFile || !projectName}
          className='w-full flex items-center justify-center bg-primary text-background font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Upload className='mr-2 h-5 w-5' />
          {isLoading ? 'Uploading...' : 'Upload Assets & Proceed to Payment'}
        </button>
      </form>
    </div>
  );
};
