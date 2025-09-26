import React from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import { Zap } from 'lucide-react';

export const TrainingProgressPhase = () => {
  const { trainerCount } = useTraining();
  return (
    <div className='bg-surface p-8 rounded-xl border border-border'>
      <div className='flex items-center gap-3 mb-6'>
        <Zap className='w-6 h-6 text-primary animate-pulse' />
        <h2 className='text-xl font-semibold text-text-primary'>
          Training in Progress
        </h2>
      </div>
      <div className='space-y-4'>
        <div className='flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg'>
          <span className='text-text-primary'>
            Distributed computation started
          </span>
          <span className='text-primary font-mono'>
            {trainerCount} nodes active
          </span>
        </div>
        <div className='w-full bg-background/50 rounded-full h-2.5 overflow-hidden'>
          <div className='h-full bg-primary rounded-full animate-pulse'></div>
        </div>
        <p className='text-center text-text-secondary text-sm'>
          Training can take several minutes. Results will be published to Hedera
          upon completion.
        </p>
      </div>
    </div>
  );
};
