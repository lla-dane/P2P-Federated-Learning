import React from 'react';
import { Link } from 'react-router-dom';
import { useTraining } from '../../contexts/TrainingContext';
import { Rocket, History } from 'lucide-react';

export const TrainingProgressPhase = () => {
  const { trainerCount } = useTraining();
  return (
    <div className='bg-surface p-8 rounded-xl border border-border'>
      <div className='text-center flex flex-col items-center'>
        <div className='w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30'>
          <Rocket className='w-8 h-8 text-primary' />
        </div>
        <h2 className='text-2xl font-bold text-text-primary mb-3'>
          Training Launched Successfully!
        </h2>
        <p className='text-text-secondary mb-4 max-w-lg'>
          Your training job has been submitted to the network and is now being
          processed by{' '}
          <span className='font-bold text-primary'>
            {trainerCount} trainer nodes
          </span>
          .
        </p>
        <p className='text-text-secondary mb-8 max-w-lg'>
          You can now safely leave this page. The final status and model weights
          will appear on the Training History page upon completion.
        </p>
        <Link
          to='/history'
          className='flex items-center justify-center gap-2 bg-primary text-background font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all'
        >
          <History className='w-5 h-5' />
          Go to Training History
        </Link>
      </div>
    </div>
  );
};
