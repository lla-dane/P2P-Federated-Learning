import React from 'react';
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Loader,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';
import type { TrainingProject } from '../../pages/TrainingHistory';

const getStatusInfo = (status: TrainingProject['status']) => {
  switch (status) {
    case 'Completed':
      return { icon: CheckCircle, color: 'text-green-400', label: 'Completed' };
    case 'Running':
      return {
        icon: Loader,
        color: 'text-primary animate-spin',
        label: 'Running',
      };
    case 'Initialized':
      return { icon: Clock, color: 'text-yellow-400', label: 'Initialized' };
    case 'Failed':
      return { icon: XCircle, color: 'text-red-400', label: 'Failed' };
    default:
      return {
        icon: PlayCircle,
        color: 'text-text-secondary',
        label: 'Unknown',
      };
  }
};

interface HistoryTableProps {
  history: TrainingProject[];
  onViewDetails: (project: TrainingProject) => void;
  onDelete: (projectId: string) => void;
}

export const HistoryTable = ({
  history,
  onViewDetails,
  onDelete,
}: HistoryTableProps) => {
  return (
    <div className='bg-surface p-6 rounded-xl border border-border'>
      {history.length === 0 ? (
        <p className='text-text-secondary text-center py-8'>
          No training jobs found yet.
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full text-text-primary'>
            <thead>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                  Project Name
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                  Date Created
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {history.map((training) => {
                const statusInfo = getStatusInfo(training.status);
                return (
                  <tr
                    key={training.id}
                    className='hover:bg-background transition-colors'
                  >
                    <td className='px-4 py-4 whitespace-nowrap font-medium'>
                      {training.projectName}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center gap-2 text-sm ${statusInfo.color}`}
                      >
                        <statusInfo.icon size={16} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-text-secondary'>
                      {new Date(training.date).toLocaleString()}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-right'>
                      <div className='flex items-center justify-end gap-4'>
                        <button
                          onClick={() => onViewDetails(training)}
                          className='flex items-center gap-1 text-sm text-primary hover:text-primary/80 ml-auto'
                        >
                          <Eye size={16} /> View Details
                        </button>
                        <button
                          onClick={() => onDelete(training.id)}
                          className='text-red-500 hover:text-red-400'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
