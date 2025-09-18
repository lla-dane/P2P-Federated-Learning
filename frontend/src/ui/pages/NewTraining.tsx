import FileUpload from '../components/FileUpload';
import { Database, FileCode } from 'lucide-react';

const NewTrainingPage = () => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-text-primary mb-2'>
        Start a New Training Job
      </h1>
      <p className='text-text-secondary mb-8'>
        Upload your dataset and Python script to begin the training process.
      </p>

      <div className='max-w-3xl mx-auto bg-surface p-8 rounded-xl border border-border'>
        <form className='space-y-6'>
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
            />
          </div>

          <FileUpload label='Dataset (.zip, .csv, etc.)' fileType='dataset' />
          <FileUpload label='Python Script (.py)' fileType='Python script' />

          <button
            type='submit'
            className='w-full bg-primary text-background font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity'
          >
            Start Training
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTrainingPage;
