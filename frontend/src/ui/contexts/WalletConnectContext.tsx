import {
  createContext,
  useState,
  type ReactNode,
  useContext,
  useEffect,
} from 'react';
import axios from 'axios';

const HEDERA_TESTNET_MIRROR_NODE_API =
  'https://testnet.mirrornode.hedera.com/api/v1';

interface IWalletContext {
  accountId: string;
  setAccountId: (val: string) => void;
  isConnected: boolean;
  setIsConnected: (val: boolean) => void;
  balance: string | null;
}

const defaultValue: IWalletContext = {
  accountId: '',
  setAccountId: () => {},
  isConnected: false,
  setIsConnected: () => {},
  balance: null,
};

export const WalletConnectContext = createContext(defaultValue);

export const WalletConnectProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [accountId, setAccountId] = useState(defaultValue.accountId);
  const [isConnected, setIsConnected] = useState(defaultValue.isConnected);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (accountId && isConnected) {
        try {
          const response = await axios.get(
            `${HEDERA_TESTNET_MIRROR_NODE_API}/accounts/${accountId}`
          );
          const hbar = (response.data?.balance?.balance / 100_000_000).toFixed(
            4
          );
          setBalance(hbar);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };
    fetchBalance();
  }, [accountId, isConnected]);

  return (
    <WalletConnectContext.Provider
      value={{ accountId, setAccountId, isConnected, setIsConnected, balance }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnect = () => useContext(WalletConnectContext);
