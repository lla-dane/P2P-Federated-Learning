import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react';
import { dappConnector } from '../services/WalletConnect';
import axios from 'axios';

interface IWalletContext {
  accountId: string | undefined;
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<IWalletContext | undefined>(undefined);
const HEDERA_TESTNET_MIRROR_NODE_API =
  'https://testnet.mirrornode.hedera.com/api/v1';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [accountId, setAccountId] = useState<string | undefined>();
  const [balance, setBalance] = useState<string | null>(null);

  const syncAccount = () => {
    const signer = dappConnector.signers[0];
    const newAccountId = signer?.getAccountId()?.toString();
    setAccountId(newAccountId);
  };

  const connect = async () => {
    await dappConnector.openModal();
    syncAccount();
  };

  const disconnect = async () => {
    await dappConnector.disconnectAll();
    syncAccount();
  };

  useEffect(() => {
    const initialize = async () => {
      await dappConnector.init();
      syncAccount();
    };
    initialize();

    dappConnector.walletConnectClient!.on('session_update', syncAccount);
    dappConnector.walletConnectClient!.on('session_delete', syncAccount);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (accountId) {
        try {
          const response = await axios.get(
            `${HEDERA_TESTNET_MIRROR_NODE_API}/accounts/${accountId}`
          );
          const tinybars = response.data?.balance?.balance || 0;
          const hbar = (tinybars / 100_000_000).toFixed(4);
          setBalance(hbar);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(null);
        }
      }
    };
    fetchBalance();
  }, [accountId]);

  return (
    <WalletContext.Provider value={{ accountId, balance, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
