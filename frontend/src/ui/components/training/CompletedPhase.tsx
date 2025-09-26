import React from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import { CheckCircle2, Copy, Eye, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const CompletedPhase = () => {
  const { result, resetTraining } = useTraining();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const viewOnExplorer = () => {
    if (result?.transactionId) {
      window.electronAPI.openExternalLink(
        `https://hashscan.io/testnet/transaction/${result.transactionId}`
      );
    }
  };

  return (
    <div className='bg-surface p-8 rounded-xl border border-border'>
      <div className='flex items-center gap-3 mb-6'>
        <CheckCircle2 className='w-6 h-6 text-green-500' />
        <h2 className='text-xl font-semibold text-text-primary'>
          Training Completed Successfully!
        </h2>
      </div>
      <div className='space-y-4'>
        <div className='bg-background border border-border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-text-secondary'>
              Model Weights Hash
            </span>
            <button
              onClick={() => copyToClipboard(result?.weightsHash || '')}
              className='text-xs text-primary hover:text-primary/80 flex items-center gap-1'
            >
              <Copy className='w-3 h-3' /> Copy
            </button>
          </div>
          <code className='text-xs font-mono text-text-primary bg-surface px-3 py-2 rounded block break-all'>
            {result?.weightsHash || 'N/A'}
          </code>
        </div>
        <div className='bg-background border border-border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-text-secondary'>
              Hedera Transaction ID
            </span>
            <button
              onClick={viewOnExplorer}
              className='text-xs text-primary hover:text-primary/80 flex items-center gap-1'
            >
              <Eye className='w-3 h-3' /> View on Explorer
            </button>
          </div>
          <code className='text-xs font-mono text-text-primary bg-surface px-3 py-2 rounded block break-all'>
            {result?.transactionId || 'N/A'}
          </code>
        </div>
        <button
          onClick={resetTraining}
          className='w-full flex items-center justify-center bg-primary text-background font-semibold py-3 px-4 rounded-lg hover:bg-primary/90'
        >
          <RotateCcw className='mr-2 h-5 w-5' />
          Start Another Training
        </button>
      </div>
    </div>
  );
};
