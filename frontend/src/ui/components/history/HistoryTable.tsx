import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Loader,
  Clock,
  Eye,
  Trash2,
  FileText,
  Calendar,
  Zap,
  Users,
} from 'lucide-react';
import type { TrainingProject } from '../../pages/TrainingHistory';

const getStatusInfo = (status: TrainingProject['status']) => {
  switch (status) {
    case 'Completed':
      return {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/20',
        label: 'Completed',
      };
    case 'Running':
      return {
        icon: Loader,
        color: 'text-blue-400 animate-spin',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        label: 'Running',
      };
    case 'Initialized':
      return {
        icon: Clock,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20',
        label: 'Initialized',
      };
    case 'Failed':
      return {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/20',
        label: 'Failed',
      };
    default:
      return {
        icon: PlayCircle,
        color: 'text-text-secondary',
        bgColor: 'bg-surface border-border',
        label: 'Unknown',
      };
  }
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

interface HistoryTableProps {
  history: TrainingProject[];
  onViewDetails: (project: TrainingProject) => void;
  onViewLogs: (project: TrainingProject) => void;
  onDelete: (projectId: string) => void;
}

export const HistoryTable = ({
  history,
  onViewDetails,
  onViewLogs,
  onDelete,
}: HistoryTableProps) => {
  return (
    <div className='bg-surface rounded-xl border border-border overflow-hidden'>
      {history.length === 0 ? (
        <div className='text-center py-16'>
          <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Zap className='w-8 h-8 text-primary/60' />
          </div>
          <h3 className='text-lg font-medium text-text-primary mb-2'>
            No Training Jobs Yet
          </h3>
          <p className='text-text-secondary max-w-md mx-auto'>
            Start your first decentralized AI training job to see your history
            here.
          </p>
        </div>
      ) : (
        <>
          <div className='bg-background/50 border-b border-border px-6 py-4'>
            <h3 className='text-lg font-semibold text-text-primary flex items-center gap-2'>
              <FileText className='w-5 h-5 text-primary' />
              Training History ({history.length})
            </h3>
          </div>

          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-background/30'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                    Project Details
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                    Date Created
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {history.map((training, index) => {
                  const statusInfo = getStatusInfo(training.status);
                  // Mock trainer nodes data only
                  const trainerNodes = Math.floor(Math.random() * 8) + 3;

                  return (
                    <tr
                      key={training.id}
                      className='hover:bg-background/50 transition-all duration-200 group'
                    >
                      <td className='px-6 py-4'>
                        <div>
                          <div className='font-semibold text-text-primary group-hover:text-primary transition-colors'>
                            {training.projectName}
                          </div>
                          <div className='flex items-center gap-4 mt-1 text-xs text-text-secondary'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              {new Date(training.date).toLocaleDateString()}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Users className='w-3 h-3' />
                              {trainerNodes} nodes
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border text-text-secondary ${statusInfo.bgColor}`}
                        >
                          <statusInfo.icon
                            size={14}
                            className={statusInfo.color}
                          />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-text-secondary'>
                          {new Date(training.date).toLocaleString()}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => onViewDetails(training)}
                            className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 
                                     bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200'
                            title='View Details'
                          >
                            <Eye size={14} />
                            Details
                          </button>
                          <button
                            onClick={() => onViewLogs(training)}
                            className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 
                                     bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all duration-200'
                            title='View Training Logs'
                          >
                            <FileText size={14} />
                            Logs
                          </button>
                          <button
                            onClick={() => onDelete(training.id)}
                            className='p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200'
                            title='Delete Project'
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className='md:hidden divide-y divide-border'>
            {history.map((training, index) => {
              const statusInfo = getStatusInfo(training.status);
              // Mock trainer nodes data only
              const trainerNodes = Math.floor(Math.random() * 8) + 3;

              return (
                <div
                  key={training.id}
                  className='p-6 hover:bg-background/50 transition-colors'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h4 className='font-semibold text-text-primary mb-1'>
                        {training.projectName}
                      </h4>
                      <div className='flex items-center gap-3 text-xs text-text-secondary'>
                        <span className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {new Date(training.date).toLocaleDateString()}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Users className='w-3 h-3' />
                          {trainerNodes} nodes
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.bgColor}`}
                    >
                      <statusInfo.icon size={12} className={statusInfo.color} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className='text-xs text-text-secondary mb-4'>
                    Created: {new Date(training.date).toLocaleDateString()} •{' '}
                    {trainerNodes} trainer nodes
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onViewDetails(training)}
                      className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary 
                               bg-primary/10 rounded-lg flex-1 justify-center'
                    >
                      <Eye size={14} />
                      Details
                    </button>
                    <button
                      onClick={() => onViewLogs(training)}
                      className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-400 
                               bg-blue-500/10 rounded-lg flex-1 justify-center'
                    >
                      <FileText size={14} />
                      Logs
                    </button>
                    <button
                      onClick={() => onDelete(training.id)}
                      className='p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
