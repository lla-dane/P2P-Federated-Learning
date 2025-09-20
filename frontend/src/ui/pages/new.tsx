import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import {
  Loader2,
  Brain,
  Zap,
  CheckCircle2,
  Upload,
  Play,
  Shield,
  Database,
  Network,
  Sparkles,
} from 'lucide-react';
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

  const getProgressSteps = () => [
    {
      icon: Upload,
      label: 'Upload Files',
      completed: datasetFile && modelFile,
      active: !datasetFile || !modelFile,
    },
    {
      icon: Brain,
      label: 'Configure',
      completed: projectName && datasetFile && modelFile,
      active: datasetFile && modelFile && !projectName,
    },
    {
      icon: Play,
      label: 'Train Model',
      completed: result,
      active: isLoading,
    },
  ];

  return (
    <div className='min-h-full'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='relative'>
            <div className='w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30'>
              <Brain className='w-6 h-6 text-primary' />
            </div>
            <div className='absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse'></div>
          </div>
          <div>
            <h1 className='text-3xl font-bold text-text-primary'>
              New Training Job
            </h1>
            <p className='text-text-secondary'>
              Deploy AI models on the decentralized network
            </p>
          </div>
        </div>

        {/* Blockchain Network Status */}
        <div className='flex items-center gap-6 p-4 bg-surface/50 border border-border rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-sm text-text-secondary'>
              Network: Connected
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Shield className='w-4 h-4 text-primary' />
            <span className='text-sm text-text-secondary'>
              Security: Verified
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Network className='w-4 h-4 text-primary' />
            <span className='text-sm text-text-secondary'>
              Nodes: 1,247 active
            </span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between relative'>
          {getProgressSteps().map((step, index) => (
            <div
              key={index}
              className='flex flex-col items-center flex-1 relative z-10'
            >
              <div
                className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 mb-2 border
                ${
                  step.completed
                    ? 'bg-primary text-background border-primary shadow-lg shadow-primary/25'
                    : step.active
                    ? 'bg-primary/20 text-primary border-primary animate-pulse'
                    : 'bg-surface border-border text-text-secondary'
                }
              `}
              >
                <step.icon className='w-5 h-5' />
              </div>
              <span
                className={`text-xs font-medium ${
                  step.completed || step.active
                    ? 'text-text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}

          {/* Progress Line */}
          <div className='absolute top-5 left-0 right-0 h-px bg-border -z-0'>
            <div
              className={`h-full bg-primary transition-all duration-500 ${
                result
                  ? 'w-full'
                  : projectName && datasetFile && modelFile
                  ? 'w-2/3'
                  : datasetFile && modelFile
                  ? 'w-1/3'
                  : 'w-0'
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className='bg-surface border border-border rounded-lg p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Project Configuration Header */}
          <div className='border-b border-border pb-4'>
            <h2 className='text-lg font-semibold text-text-primary flex items-center gap-2'>
              <Database className='w-5 h-5 text-primary' />
              Project Configuration
            </h2>
            <p className='text-sm text-text-secondary mt-1'>
              Configure your decentralized AI training parameters
            </p>
          </div>

          {/* Project Name */}
          <div className='space-y-2'>
            <label
              htmlFor='projectName'
              className='block text-sm font-medium text-text-primary'
            >
              Project Name
            </label>
            <div className='relative'>
              <input
                type='text'
                id='projectName'
                placeholder='e.g., Advanced Image Classification Model'
                className='w-full bg-background border border-border text-text-primary rounded-lg px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary 
                         transition-all duration-200 placeholder-text-secondary'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              {projectName && (
                <CheckCircle2 className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500' />
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-text-primary'>
                Training Dataset
              </label>
              <div className='relative'>
                <FileUpload
                  label='Upload Dataset (.zip, .csv, .parquet)'
                  fileType='dataset'
                  onFileSelect={setDatasetFile}
                />
                {datasetFile && (
                  <div className='absolute -top-1 -right-1'>
                    <div className='w-3 h-3 bg-primary rounded-full animate-pulse'></div>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-text-primary'>
                Training Script
              </label>
              <div className='relative'>
                <FileUpload
                  label='Upload Python Script (.py)'
                  fileType='Python script'
                  onFileSelect={setModelFile}
                />
                {modelFile && (
                  <div className='absolute -top-1 -right-1'>
                    <div className='w-3 h-3 bg-primary rounded-full animate-pulse'></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blockchain Parameters */}
          <div className='border border-border/50 rounded-lg p-4 bg-background/50'>
            <h3 className='text-sm font-semibold text-text-primary mb-3 flex items-center gap-2'>
              <Shield className='w-4 h-4 text-primary' />
              Blockchain Parameters
            </h3>
            <div className='grid md:grid-cols-2 gap-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-text-secondary'>Network Fee:</span>
                <span className='text-text-primary font-mono'>0.001 ETH</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text-secondary'>Consensus:</span>
                <span className='text-primary'>Proof of Training</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text-secondary'>Validation Nodes:</span>
                <span className='text-text-primary font-mono'>5 minimum</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text-secondary'>Estimated Time:</span>
                <span className='text-text-primary font-mono'>15-30 min</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading || !projectName || !datasetFile || !modelFile}
            className='w-full flex items-center justify-center bg-primary text-background font-semibold py-3 px-4 rounded-lg 
                     hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 group relative overflow-hidden'
          >
            {/* Animated background */}
            <div
              className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000'
            ></div>

            <div className='relative flex items-center'>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Deploying to Network...
                </>
              ) : (
                <>
                  <Play className='mr-2 h-5 w-5' />
                  Deploy Training Job
                </>
              )}
            </div>
          </button>
        </form>

        {/* Status Message */}
        {(isLoading || statusMessage) && (
          <div className='mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg'>
            <div className='flex items-center gap-3'>
              <div className='w-2 h-2 bg-primary rounded-full animate-pulse'></div>
              <p className='text-text-primary text-sm font-medium'>
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className='mt-6 p-6 bg-primary/10 border border-primary/30 rounded-lg'>
            <div className='flex items-center mb-4'>
              <CheckCircle2 className='w-6 h-6 text-primary mr-3' />
              <h3 className='text-lg font-semibold text-text-primary'>
                Training Job Deployed Successfully!
              </h3>
            </div>

            <div className='space-y-4'>
              <div className='bg-background border border-border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-text-secondary'>
                    Dataset Hash
                  </span>
                  <button className='text-xs text-primary hover:underline'>
                    Copy
                  </button>
                </div>
                <code className='text-xs font-mono text-text-primary bg-surface px-2 py-1 rounded break-all block'>
                  {result.datasetHash}
                </code>
              </div>

              <div className='bg-background border border-border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-text-secondary'>
                    Model Hash
                  </span>
                  <button className='text-xs text-primary hover:underline'>
                    Copy
                  </button>
                </div>
                <code className='text-xs font-mono text-text-primary bg-surface px-2 py-1 rounded break-all block'>
                  {result.modelHash}
                </code>
              </div>

              <div className='flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20'>
                <span className='text-sm text-text-secondary'>
                  Blockchain Transaction:
                </span>
                <span className='text-primary text-sm font-mono'>
                  0x7f2c...a8b9
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className='grid md:grid-cols-3 gap-4 mt-8'>
        {[
          {
            icon: Shield,
            title: 'Decentralized Security',
            description: 'Your models are secured by blockchain consensus',
            accent: 'text-blue-400',
          },
          {
            icon: Network,
            title: 'Distributed Computing',
            description: 'Leverage global network of training nodes',
            accent: 'text-purple-400',
          },
          {
            icon: Sparkles,
            title: 'Proof of Training',
            description: 'Verifiable training process with cryptographic proof',
            accent: 'text-emerald-400',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className='bg-surface/50 border border-border rounded-lg p-4 hover:bg-surface/80 transition-colors duration-200'
          >
            <feature.icon className={`w-6 h-6 ${feature.accent} mb-3`} />
            <h3 className='font-semibold text-text-primary mb-2'>
              {feature.title}
            </h3>
            <p className='text-sm text-text-secondary leading-relaxed'>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewTrainingPage;
