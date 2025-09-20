import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react';
import { toast } from 'sonner';
import { useSettings } from './SettingsContext';
import {
  initializePinata,
  uploadDatasetInChunks,
  uploadFile,
  onProgress,
} from '../utils/ipfsHelper';
import { addTrainingHistory } from '../utils/historyHelper';

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
      initializePinata(settings.jwt);
    }
    onProgress((message) => {
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
      const datasetHash = await uploadDatasetInChunks(datasetPath);
      toast.loading('Uploading model file...', { id: toastId });
      const modelHash = await uploadFile(modelPath);

      toast.success('Upload successful!', { id: toastId });
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
