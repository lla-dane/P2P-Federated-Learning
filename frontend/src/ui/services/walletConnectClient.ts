import { useContext, useEffect, useCallback } from 'react';
import { WalletConnectContext } from '../contexts/WalletConnectContext';
import {
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractId,
  Hbar,
  LedgerId,
  Client,
} from '@hashgraph/sdk';
import {
  DAppConnector,
  HederaChainId,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  transactionToBase64String,
  type SignAndExecuteTransactionParams,
} from '@hashgraph/hedera-wallet-connect';
import type { SignClientTypes } from '@walletconnect/types';
import EventEmitter from 'events';
import type { ContractFunctionParameterBuilder } from './contractFunctionParameterBuilder';

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

let walletConnectInitPromise: Promise<void> | undefined = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dappConnector.init();
  }
  await walletConnectInitPromise;
};

export const openWalletConnectModal = async () => {
  await initializeWalletConnect();
  // The .then() ensures we emit the sync event AFTER the modal is closed
  await dappConnector.openModal().then(() => {
    refreshEvent.emit('sync');
  });
};

class WalletConnectWallet {
  // This is where transaction methods like transferHBAR will go.
  // For now, it only needs the disconnect method.
  disconnect() {
    dappConnector.disconnectAll().then(() => {
      refreshEvent.emit('sync');
    });
  }

  async executeContractFunction(
    contractId: ContractId,
    functionName: string,
    functionParameters: ContractFunctionParameterBuilder,
    gasLimit: number,
    payableAmount: Hbar
  ): Promise<string | null> {
    const signerAccountId = dappConnector.signers[0]?.getAccountId();
    if (!signerAccountId)
      throw new Error('Wallet not connected or account not found.');

    const tx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(gasLimit)
      .setFunction(functionName, functionParameters.buildHAPIParams())
      .setPayableAmount(payableAmount)
      .freezeWithSigner(dappConnector.signers[0]);

    const params: SignAndExecuteTransactionParams = {
      signerAccountId: signerAccountId.toString(),
      transactionList: transactionToBase64String(await tx),
    };

    const result = await dappConnector.signAndExecuteTransaction(params);
    console.log(result);
    const transactionId = (result as any)?.transactionId;

    console.log(transactionId);
    return transactionId || null;
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
