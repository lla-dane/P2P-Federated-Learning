import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import { toast } from 'sonner';
import { useSettings } from './SettingsContext';
import {
  addTrainingHistory,
  updateTrainingHistoryItem,
} from '../utils/historyHelper';
import {
  configureAkave,
  onAkaveProgress,
  uploadDatasetToAkave,
  uploadFileToAkave,
} from '../utils/akaveHelpers';
import {
  fetchNetworkState,
  initializeTrainingRound,
  startFinalTraining,
} from '../utils/apiHelper';
import { ContractId, Hbar, TopicId } from '@hashgraph/sdk';
import { ContractFunctionParameterBuilder } from '../services/contractFunctionParameterBuilder';
import { useWalletInterface } from '../services/useWalletInterface';
import { getTaskId } from '../utils/hederaHelper';
import { data } from 'react-router-dom';
import { CONTRACT_ID } from '../utils/constant';

export type TrainingPhase =
  | 'upload'
  | 'assembling'
  | 'payment'
  | 'training'
  | 'completed';

interface ITrainingResult {
  datasetHash?: string;
  chunkCount?: number;
  modelHash?: string;
  weightsHash?: string;
  transactionId?: string;
}

interface ITrainingContext {
  // State
  currentPhase: TrainingPhase;
  isLoading: boolean;
  trainerCount: number;
  activeJobId: string | null;
  result: ITrainingResult | null;
  projectName: string | null;
  trainerNodes: TrainerNodeInfo[];
  // Actions
  uploadAssets: (
    projectName: string,
    datasetPath: string,
    modelPath: string
  ) => Promise<void>;
  payAndInitialize: (tokenAmount: string) => Promise<string | number | void>;
  beginFinalTraining: () => Promise<string | number | void>;
  resetTraining: () => void;
}

export interface TrainerNodeInfo {
  peer_id: string;
  pub_maddr: string;
  maddr: string;
  role: 'TRAINER' | 'CLIENT';
}

const TrainingContext = createContext<ITrainingContext | undefined>(undefined);

export const TrainingProvider = ({ children }: { children: ReactNode }) => {
  const [currentPhase, setCurrentPhase] = useState<TrainingPhase>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [trainerCount, setTrainerCount] = useState(0);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [result, setResult] = useState<ITrainingResult | null>(null);
  const { isConfigured, settings } = useSettings();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [trainerNodes, setTrainerNodes] = useState<TrainerNodeInfo[]>([]);
  const activeToastId = useRef<string | number | null>(null);
  const [projectId, setProjectId] = useState<string>('');
  const { actions } = useWalletInterface();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentPhase === 'assembling' && projectId) {
      const poll = async () => {
        try {
          const response = await fetchNetworkState();
          if (response.status === 'ok' && response.bootmesh[projectId]) {
            const allPeers = response.bootmesh[projectId];
            const trainers = allPeers.filter((peer) => peer.role === 'TRAINER');

            setTrainerCount(trainers.length);
            setTrainerNodes(
              trainers.map((t) => ({
                peer_id: t.peer_id,
                pub_maddr: t.pub_maddr,
                maddr: t.maddr,
                role: t.role,
              }))
            );
          }
        } catch (error) {
          console.error('Polling for trainers failed:', error);
          // Optional: stop polling on error
          // clearInterval(interval);
        }
      };

      poll();
      interval = setInterval(poll, 5000);
    }
    return () => clearInterval(interval);
  }, [currentPhase, projectId]);

  useEffect(() => {
    if (isConfigured) {
      configureAkave(settings);
    }
    onAkaveProgress((message) => {
      if (isLoading && activeToastId.current) {
        toast.loading(message, { id: activeToastId.current });
      }
    });
  }, [settings, isConfigured, isLoading]);

  const uploadAssets = async (
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

    const jobId = `proj_${Date.now()}`;
    setActiveJobId(jobId);
    setProjectName(projectName);

    setIsLoading(true);
    setResult(null);
    activeToastId.current = toast.loading('Preparing to upload...');

    try {
      toast.loading('Uploading dataset to Akave...', {
        id: activeToastId.current,
      });
      const { datasetHash, chunkCount } = await uploadDatasetToAkave(
        datasetPath
      );

      toast.loading('Uploading model to Akave...', {
        id: activeToastId.current,
      });
      const modelHash = await uploadFileToAkave(modelPath);
      console.log(datasetHash, modelHash);
      toast.success('Upload to Akave successful!', {
        id: activeToastId.current,
      });
      setResult({ datasetHash, chunkCount, modelHash });
      setCurrentPhase('payment');
    } catch (error) {
      console.error(error);
      toast.error('Upload Failed', {
        id: activeToastId.current,
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const payAndInitialize = async (tokenAmount: string) => {
    if (!result?.datasetHash || !result?.modelHash || !activeJobId) {
      return toast.error('Missing required data to start training.');
    }

    setIsLoading(true);
    const toastId = toast.loading(`Sending ${tokenAmount} HBAR payment...`);

    try {
      const params = new ContractFunctionParameterBuilder()
        .addParam({ type: 'string', value: result.modelHash })
        .addParam({ type: 'string', value: result.datasetHash })
        .addParam({ type: 'uint256', value: result.chunkCount });

      const transactionId = await actions.executeContractFunction(
        ContractId.fromString(CONTRACT_ID),
        'createTask',
        params,
        10_000_000,
        Hbar.fromString(tokenAmount)
      );

      console.log('Transaction ID from contract call:', transactionId);

      if (!transactionId) {
        throw new Error('Transaction was not confirmed by the wallet.');
      }

      const projId = await getTaskId();
      setProjectId(projId);

      console.log('Received project ID from contract:', projId);

      toast.loading('Initializing training round on the network...', {
        id: toastId,
      });

      console.log('Initializing training round for project ID:', projId);

      const success = await initializeTrainingRound(projId);
      if (!success) {
        throw new Error('Failed to initialize training round on the network.');
      }

      await addTrainingHistory({
        id: projId,
        projectName,
        datasetHash: result.datasetHash,
        modelHash: result.modelHash,
        date: new Date().toISOString(),
        status: 'Initialized',
        weightsHash: null,
        isTrained: false,
      });

      toast.success('Training round initialized successfully!', {
        id: toastId,
      });

      setCurrentPhase('assembling');
    } catch (error) {
      console.error(error);
      toast.error('Transaction Failed', {
        id: toastId,
        description: (error as Error).message,
      });
      setCurrentPhase('payment');
    } finally {
      setIsLoading(false);
    }
  };

  function arrayBufferToBase64(buffer: any) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // avoid stack overflow for big buffers

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }

    return btoa(binary);
  }

  // Wrap Base64 with PEM headers
  function toPem(base64: any, label: any) {
    const lines = base64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label} KEY-----\n${lines}\n-----END ${label} KEY-----`;
  }

  const beginFinalTraining = async () => {
    if (!result?.datasetHash || !result?.modelHash || !projectId) {
      return toast.error('Missing asset hashes. Cannot start training.');
    }

    setIsLoading(true);
    const toastId = toast.loading('Sending command to start final training...');

    try {
      const { publicKey, privateKey } = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );
      const spki = await crypto.subtle.exportKey('spki', publicKey);
      const publicPem: string = toPem(arrayBufferToBase64(spki), 'PUBLIC');

      let transformed = publicPem
        .replace('BEGIN PUBLIC KEY', 'BEGIN#PUBLIC#KEY')
        .replace('END PUBLIC KEY', 'END#PUBLIC#KEY');
      transformed = transformed.replace(/\n/g, '?');

      // Export private key (PKCS#8)
      const pkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey);
      const privatePem = toPem(arrayBufferToBase64(pkcs8), 'PRIVATE');
      // TODO: Store the private key
      const success = await startFinalTraining({
        projectId,
        datasetAndModelHashAndPublicKey: `${result.datasetHash} ${result.modelHash} ${transformed}`,
      });
      console.log('public key: ', transformed);

      if (!success) {
        throw new Error('Backend did not confirm the training start command.');
      }

      await updateTrainingHistoryItem({ projectId, newStatus: 'Running' });

      const topicId = TopicId.fromString('0.0.6914391');
      window.electronAPI.startLogSubscription({
        projectId: projectId,
        topicId: topicId.toString(),
      });

      toast.success('Training is now in progress on the network!', {
        id: toastId,
      });
      setCurrentPhase('training');
    } catch (error) {
      console.error(error);
      toast.error('Failed to Start Training', {
        id: toastId,
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetTraining = () => {
    setCurrentPhase('upload');
    setResult(null);
    setTrainerCount(0);
    setActiveJobId(null);
  };

  return (
    <TrainingContext.Provider
      value={{
        currentPhase,
        isLoading,
        trainerCount,
        activeJobId,
        result,
        projectName,
        trainerNodes,
        uploadAssets,
        payAndInitialize,
        beginFinalTraining,
        resetTraining,
      }}
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
