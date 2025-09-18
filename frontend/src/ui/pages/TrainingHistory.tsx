import { PlayCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

const dummyTrainings = [
  {
    id: 'tr-001',
    projectName: 'Image Recognition V1',
    dataset: 'images_v1.zip',
    script: 'resnet_model.py',
    status: 'Completed',
    date: '2024-03-10 14:30',
  },
  {
    id: 'tr-002',
    projectName: 'NLP Sentiment Analysis',
    dataset: 'tweets_sentiment.csv',
    script: 'bert_classifier.py',
    status: 'Running',
    date: '2024-03-09 11:00',
  },
  {
    id: 'tr-003',
    projectName: 'Fraud Detection Model',
    dataset: 'transactions_q1.csv',
    script: 'xgboost_fraud.py',
    status: 'Failed',
    date: '2024-03-08 09:15',
  },
  {
    id: 'tr-004',
    projectName: 'Recommendation Engine',
    dataset: 'user_ratings.zip',
    script: 'collaborative_filtering.py',
    status: 'Completed',
    date: '2024-03-07 16:45',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle size={18} className='text-green-500' />;
    case 'Running':
      return <Loader size={18} className='text-primary animate-spin' />;
    case 'Failed':
      return <XCircle size={18} className='text-red-500' />;
    default:
      return <PlayCircle size={18} className='text-text-secondary' />;
  }
};

const TrainingHistoryPage = () => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-text-primary mb-2'>
        Training History
      </h1>
      <p className='text-text-secondary mb-8'>
        Overview of all past and current machine learning model training jobs.
      </p>

      <div className='bg-surface p-6 rounded-xl border border-border'>
        {dummyTrainings.length === 0 ? (
          <p className='text-text-secondary text-center py-8'>
            No training jobs found yet.
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-text-primary divide-y divide-border'>
              <thead>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                    Project Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                    Dataset
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                    Script
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider'>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {dummyTrainings.map((training) => (
                  <tr
                    key={training.id}
                    className='hover:bg-background transition-colors'
                  >
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <PlayCircle size={18} className='mr-2 text-primary' />
                        {training.projectName}
                      </div>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-text-secondary'>
                      {training.dataset}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-text-secondary'>
                      {training.script}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm'>
                      <span className='inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium'>
                        {getStatusIcon(training.status)}
                        <span
                          className={
                            training.status === 'Completed'
                              ? 'text-green-400'
                              : training.status === 'Running'
                              ? 'text-primary'
                              : training.status === 'Failed'
                              ? 'text-red-400'
                              : 'text-text-secondary'
                          }
                        >
                          {training.status}
                        </span>
                      </span>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-text-secondary'>
                      {training.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingHistoryPage;
