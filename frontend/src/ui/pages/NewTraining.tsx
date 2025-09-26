import React from 'react';
import { Brain } from 'lucide-react';
import { useTraining } from '../contexts/TrainingContext';
import { TrainingStepper } from '../components/training/TrainingStepper';
import { UploadPhase } from '../components/training/UploadPhase';
import { AssemblingPhase } from '../components/training/AssemblingPhase';
import { PaymentPhase } from '../components/training/PaymentPhase';
import { TrainingProgressPhase } from '../components/training/TrainingProgressPhase';
import { CompletedPhase } from '../components/training/CompletedPhase';

const NewTrainingPage = () => {
  const { currentPhase } = useTraining();

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'upload':
        return <UploadPhase />;
      case 'assembling':
        return <AssemblingPhase />;
      case 'payment':
        return <PaymentPhase />;
      case 'training':
        return <TrainingProgressPhase />;
      case 'completed':
        return <CompletedPhase />;
      default:
        return <UploadPhase />;
    }
  };

  return (
    <div className='min-h-full'>
      <div className='mb-8'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30'>
            <Brain className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-text-primary'>
              Decentralized AI Training
            </h1>
            <p className='text-text-secondary'>
              Upload → Assemble → Pay → Train → Get Results
            </p>
          </div>
        </div>
      </div>

      <TrainingStepper />

      <div className='max-w-4xl mx-auto space-y-6'>{renderCurrentPhase()}</div>
    </div>
  );
};

export default NewTrainingPage;
