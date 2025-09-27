import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Loader2, Terminal } from 'lucide-react';
import type { TrainingProject } from '../../pages/TrainingHistory';

interface LogEntry {
  content: string;
  timestamp: string;
}

interface LogViewerModalProps {
  project: TrainingProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewerModal = ({
  project,
  isOpen,
  onClose,
}: LogViewerModalProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && project) {
      setIsLoading(true);
      setLogs([]);

      window.electronAPI.getLogs(project.id).then((initialLogs) => {
        console.log('initialLogs', initialLogs);
        setLogs(initialLogs);
        setIsLoading(false);
      });

      const removeListener = window.electronAPI.onNewLog((newLog: LogEntry) => {
        console.log('New real-time log received:', newLog);
        if (project.status === 'Running')
          setLogs((prevLogs) => [...prevLogs, newLog]);
      });

      return () => {
        removeListener();
      };
    }
  }, [isOpen, project]);

  //   useEffect(() => {
  //     if (logContainerRef.current) {
  //       logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  //     }
  //   }, [logs]);

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
              <Dialog.Panel className='w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface border border-border p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title
                  as='h3'
                  className='text-xl font-bold leading-6 text-text-primary flex items-center gap-2'
                >
                  <Terminal size={20} className='text-primary' />
                  Live Training Logs
                </Dialog.Title>
                <p className='text-sm text-text-secondary mt-1'>
                  Project:{' '}
                  <span className='font-semibold text-text-primary'>
                    {project?.projectName}
                  </span>
                </p>

                <div className='mt-4'>
                  <div
                    ref={logContainerRef}
                    className='h-96 bg-background p-3 rounded-lg border border-border font-mono text-xs overflow-y-auto no-scrollbar'
                  >
                    {isLoading && (
                      <div className='flex items-center justify-center h-full'>
                        <Loader2 className='animate-spin text-primary' />
                      </div>
                    )}
                    {!isLoading && logs.length === 0 && (
                      <p className='text-text-secondary font-sans'>
                        Waiting for first log entry...
                      </p>
                    )}
                    {logs.map((log, index) => (
                      <div key={index} className='flex gap-4'>
                        <span className='flex-shrink-0 text-text-secondary'>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className='text-text-primary whitespace-pre-wrap'>
                          {log.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='mt-6'>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-md border border-transparent bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30 focus:outline-none'
                    onClick={onClose}
                  >
                    Close
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
