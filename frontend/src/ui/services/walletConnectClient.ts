import { useContext, useEffect, useCallback } from 'react';
import { WalletConnectContext } from '../contexts/WalletConnectContext';
import { LedgerId } from '@hashgraph/sdk';
import {
  DAppConnector,
  HederaChainId,
  HederaJsonRpcMethod,
  HederaSessionEvent,
} from '@hashgraph/hedera-wallet-connect';
import type { SignClientTypes } from '@walletconnect/types';
import EventEmitter from 'events';

// --- Configuration & Initialization ---

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set in .env');
}

// Use an event emitter to signal state changes to the React component
const refreshEvent = new EventEmitter();

const metadata: SignClientTypes.Metadata = {
  name: 'DecentraAI',
  description: 'A decentralized ML training application.',
  url: window.location.origin,
  icons: [window.location.origin + '/vite.svg'],
};

export const dappConnector = new DAppConnector(
  metadata,
  LedgerId.TESTNET,
  projectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet]
);

// Guard to ensure walletconnect is initialized only once
let walletConnectInitPromise: Promise<void> | undefined = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dappConnector.init();
  }
  await walletConnectInitPromise;
};

// --- Exported Functions for UI to Call ---

export const openWalletConnectModal = async () => {
  await initializeWalletConnect();
  // The .then() ensures we emit the sync event AFTER the modal is closed
  await dappConnector.openModal().then(() => {
    refreshEvent.emit('sync');
  });
};

// --- Wallet Class Implementation ---

class WalletConnectWallet {
  // This is where transaction methods like transferHBAR will go.
  // For now, it only needs the disconnect method.
  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit('sync');
    });
  }
}

export const walletConnectWallet = new WalletConnectWallet();

// --- Headless React Component for State Syncing ---

export const WalletConnectClient = () => {
  const { setAccountId, setIsConnected } = useContext(WalletConnectContext);

  const syncWithWalletContext = useCallback(() => {
    const signer = dappConnector.signers[0];
    const accountId = signer?.getAccountId()?.toString();

    if (accountId) {
      setAccountId(accountId);
      setIsConnected(true);
    } else {
      setAccountId('');
      setIsConnected(false);
    }
  }, [setAccountId, setIsConnected]);

  useEffect(() => {
    initializeWalletConnect().then(() => {
      syncWithWalletContext();
    });

    refreshEvent.addListener('sync', syncWithWalletContext);

    return () => {
      refreshEvent.removeListener('sync', syncWithWalletContext);
    };
  }, [syncWithWalletContext]);

  return null;
};
