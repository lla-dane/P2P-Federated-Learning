import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Info, Copy, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { TrainingProject } from '../../pages/TrainingHistory';

const DetailRow = ({
  label,
  value,
  copyable = false,
  downloadable = false,
}: {
  label: string;
  value: string | null;
  copyable?: boolean;
  downloadable?: boolean;
}) => {
  const copy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied!`);
    }
  };

  const handleDownload = async (downloadUrl: string, label: string) => {
    if (!downloadUrl) {
      toast.error('No download URL available.');
      return;
    }

    console.log('Downloading file from URL:', downloadUrl);

    const toastId = toast.loading('Opening save dialog...');

    try {
      const downloadResult = await window.electronAPI.downloadFile({
        url: downloadUrl,
        fileName: `${label.replace(/\s/g, '_')}.txt`,
      });

      if (downloadResult.success) {
        toast.success('Download started!', { id: toastId });
      } else if (downloadResult.reason !== 'Dialog canceled') {
        throw new Error(downloadResult.reason || 'Download failed.');
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.error('Download Failed', {
        id: toastId,
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className='bg-background p-4 rounded-lg border border-border'>
      <div className='flex justify-between items-center mb-2'>
        <span className='text-text-secondary font-medium text-sm'>{label}</span>
        <div className='flex items-center gap-2'>
          {downloadable && value && value !== 'N/A' && (
            <button
              onClick={() => handleDownload(value, label)}
              className='text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors text-xs'
            >
              <Download size={12} /> Download
            </button>
          )}
          {copyable && value && value !== 'N/A' && (
            <button
              onClick={copy}
              className='text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors text-xs'
            >
              <Copy size={12} /> Copy
            </button>
          )}
        </div>
      </div>
      <p className='text-text-primary break-all font-mono text-sm bg-surface p-2 rounded border border-border/50'>
        {value || 'N/A'}
      </p>
    </div>
  );
};

const WeightsHashRow = ({ weightsHash }: { weightsHash: string | null }) => {
  if (!weightsHash || weightsHash === 'N/A') {
    return (
      <DetailRow
        label='Final Weights Hash (Hedera)'
        value={weightsHash}
        copyable
        downloadable
      />
    );
  }

  const hashes = weightsHash.includes(',')
    ? weightsHash.split(',').map((h) => h.trim())
    : [weightsHash];

  if (hashes.length === 1) {
    return (
      <DetailRow
        label='Final Weights Hash (Hedera)'
        value={weightsHash}
        copyable
        downloadable
      />
    );
  }

  const handleDownload = async (downloadUrl: string, label: string) => {
    if (!downloadUrl) {
      toast.error('No download URL available.');
      return;
    }

    const toastId = toast.loading('Opening save dialog...');

    try {
      const downloadResult = await window.electronAPI.downloadFile({
        url: downloadUrl,
        fileName: `${label.replace(/\s/g, '_')}.txt`,
      });

      if (downloadResult.success) {
        toast.success('Download started!', { id: toastId });
      } else if (downloadResult.reason !== 'Dialog canceled') {
        throw new Error(downloadResult.reason || 'Download failed.');
      } else {
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.error('Download Failed', {
        id: toastId,
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className='bg-background p-4 rounded-lg border border-border'>
      <div className='flex justify-between items-center mb-3'>
        <span className='text-text-secondary font-medium text-sm'>
          Final Weights Hash (Hedera)
        </span>
        <span className='text-xs text-text-secondary bg-surface px-2 py-1 rounded'>
          {hashes.length} files
        </span>
      </div>
      <div className='space-y-2'>
        {hashes.map((hash, index) => (
          <div
            key={index}
            className='bg-surface p-3 rounded border border-border/50'
          >
            <div className='flex justify-between items-center mb-1'>
              <span className='text-xs text-text-secondary'>
                Weight File #{index + 1}
              </span>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    handleDownload(hash, `Weight File #${index + 1}`)
                  }
                  className='text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors text-xs'
                >
                  <Download size={12} /> Download
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(hash);
                    toast.success(`Weight hash ${index + 1} copied!`);
                  }}
                  className='text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors text-xs'
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
            <p className='text-text-primary break-all font-mono text-xs'>
              {hash}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectDetailsModalProps {
  project: TrainingProject | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (projectId: string) => void;
}

export const ProjectDetailsModal = ({
  project,
  isOpen,
  onClose,
  onDelete,
}: ProjectDetailsModalProps) => {
  if (!project) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
        </Transition.Child>
        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface border border-border shadow-2xl transition-all'>
                {/* Header */}
                <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border'>
                  <Dialog.Title
                    as='h3'
                    className='text-2xl font-bold text-text-primary flex items-center gap-3'
                  >
                    <div className='w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30'>
                      <Info size={20} className='text-primary' />
                    </div>
                    Training Job Details
                  </Dialog.Title>
                  <p className='text-text-secondary mt-2'>
                    Complete information about your training job and associated
                    blockchain data
                  </p>
                </div>

                {/* Content */}
                <div className='p-6'>
                  <div className='space-y-4'>
                    <DetailRow
                      label='Project Name'
                      value={project.projectName}
                    />
                    <DetailRow label='Job ID' value={project.id} copyable />
                    <DetailRow label='Status' value={project.status} />
                    <DetailRow
                      label='Dataset Hash (Akave Key)'
                      value={project.datasetHash}
                      copyable
                      downloadable
                    />
                    <DetailRow
                      label='Model Hash (Akave Key)'
                      value={project.modelHash}
                      copyable
                      downloadable
                    />
                    <WeightsHashRow weightsHash={project.weightsHash} />
                    <DetailRow
                      label='Date Created'
                      value={new Date(project.date).toLocaleString()}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className='bg-background/50 p-6 border-t border-border flex items-center justify-between'>
                  <button
                    type='button'
                    className='flex items-center gap-2 px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50'
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button
                    type='button'
                    onClick={() => onDelete(project.id)}
                    className='flex items-center gap-2 px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50'
                  >
                    <Trash2 size={16} />
                    Delete Entry
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
