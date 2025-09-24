import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react';
import { toast } from 'sonner';
import { useSettings } from './SettingsContext';
import { addTrainingHistory } from '../utils/historyHelper';
import {
  configureAkave,
  onAkaveProgress,
  uploadDatasetToAkave,
  uploadFileToAkave,
} from '../utils/akaveHelpers';

interface ITrainingResult {
  datasetHash?: string;
  modelHash?: string;
}

interface ITrainingContext {
  isLoading: boolean;
  statusMessage: string;
  result: ITrainingResult | null;
  startTraining: (
    projectName: string,
    datasetPath: string,
    modelPath: string
  ) => Promise<void>;
}

const TrainingContext = createContext<ITrainingContext | undefined>(undefined);

export const TrainingProvider = ({ children }: { children: ReactNode }) => {
  const { settings, isConfigured } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<ITrainingResult | null>(null);

  useEffect(() => {
    if (isConfigured) {
      configureAkave(settings);
    }
    onAkaveProgress((message) => {
      if (isLoading) setStatusMessage(message);
    });
  }, [settings, isConfigured, isLoading]);

  const startTraining = async (
    projectName: string,
    datasetPath: string,
    modelPath: string
  ) => {
    if (!isConfigured) {
      toast.error('Configuration Required', {
        description:
          'Please set credentials in Settings before starting a training.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    const toastId = toast.loading('Preparing to upload...');

    try {
      toast.loading('Uploading dataset to Akave...', { id: toastId });
      const datasetHash = await uploadDatasetToAkave(datasetPath);

      toast.loading('Uploading model to Akave...', { id: toastId });
      const modelHash = await uploadFileToAkave(modelPath);

      toast.success('Upload to Akave successful!', { id: toastId });
      setResult({ datasetHash, modelHash });

      await addTrainingHistory({
        id: `proj_${Date.now()}`,
        projectName,
        datasetHash,
        modelHash,
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      toast.error('Upload Failed', {
        id: toastId,
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <TrainingContext.Provider
      value={{ isLoading, statusMessage, result, startTraining }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};
