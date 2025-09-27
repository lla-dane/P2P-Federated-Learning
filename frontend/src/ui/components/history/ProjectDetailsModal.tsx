import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Info, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TrainingProject } from '../../pages/TrainingHistory';

const DetailRow = ({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string | null;
  copyable?: boolean;
}) => {
  const copy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied!`);
    }
  };

  return (
    <div className='bg-background p-3 rounded-lg border border-border'>
      <div className='flex justify-between items-center'>
        <span className='text-text-secondary font-sans'>{label}</span>
        {copyable && value && value !== 'N/A' && (
          <button
            onClick={copy}
            className='text-primary hover:text-primary/80 flex items-center gap-1'
          >
            <Copy size={12} /> Copy
          </button>
        )}
      </div>
      <p className='text-text-primary break-all mt-1'>{value || 'N/A'}</p>
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
              <Dialog.Panel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-surface border border-border p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title
                  as='h3'
                  className='text-xl font-bold leading-6 text-text-primary flex items-center gap-2'
                >
                  <Info size={20} className='text-primary' /> Job Details
                </Dialog.Title>
                <div className='mt-4 space-y-4 font-mono text-xs'>
                  <DetailRow label='Project Name' value={project.projectName} />
                  <DetailRow label='Job ID' value={project.id} copyable />
                  <DetailRow label='Status' value={project.status} />
                  <DetailRow
                    label='Dataset Hash (Akave Key)'
                    value={project.datasetHash}
                    copyable
                  />
                  <DetailRow
                    label='Model Hash (Akave Key)'
                    value={project.modelHash}
                    copyable
                  />
                  <DetailRow
                    label='Final Weights Hash (Hedera)'
                    value={project.weightsHash}
                    copyable
                  />
                  <DetailRow
                    label='Date Created'
                    value={new Date(project.date).toLocaleString()}
                  />
                </div>
                <div className='mt-6 flex items-center justify-between'>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-md border border-transparent bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30 focus:outline-none'
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button
                    type='button'
                    onClick={() => onDelete(project.id)}
                    className='inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 focus:outline-none'
                  >
                    <Trash2 size={16} /> Delete Entry
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
