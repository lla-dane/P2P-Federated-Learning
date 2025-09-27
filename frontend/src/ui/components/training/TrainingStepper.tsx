import React from 'react';
import { Upload, Users, Coins, Play, CheckCircle2 } from 'lucide-react';
import {
  useTraining,
  type TrainingPhase,
} from '../../contexts/TrainingContext';

export const TrainingStepper = () => {
  const { currentPhase } = useTraining();

  const getPhaseStep = (phase: TrainingPhase): number => {
    const phases: TrainingPhase[] = [
      'upload',
      'payment',
      'assembling',
      'training',
    ];
    return phases.indexOf(phase) + 1;
  };

  const steps = [
    { icon: Upload, label: 'Upload', phase: 'upload' },
    { icon: Coins, label: 'Payment', phase: 'payment' },
    { icon: Users, label: 'Assemble', phase: 'assembling' },
    { icon: Play, label: 'Training', phase: 'training' },
    // { icon: CheckCircle2, label: 'Completed', phase: 'completed' },
  ];

  return (
    <div className='mb-8'>
      <div className='flex items-center justify-between relative'>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const currentPhaseNumber = getPhaseStep(currentPhase);
          const isActive = currentPhaseNumber > stepNumber;
          const isCurrent = currentPhaseNumber === stepNumber;

          return (
            <div
              key={index}
              className='flex flex-col items-center flex-1 relative z-10'
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border ${
                  isActive
                    ? 'bg-primary text-background border-primary'
                    : isCurrent
                    ? 'bg-primary/50 text-background border-primary animate-pulse'
                    : 'bg-surface border-border text-text-secondary'
                }`}
              >
                <step.icon className='w-5 h-5' />
              </div>
              <span
                className={`text-xs mt-2 ${
                  isActive || isCurrent
                    ? 'text-text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
        <div className='absolute top-5 left-0 right-0 h-px bg-border -z-0'>
          <div
            className={`h-full bg-primary transition-all duration-500`}
            style={{ width: `${(getPhaseStep(currentPhase) - 1) * 25}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
