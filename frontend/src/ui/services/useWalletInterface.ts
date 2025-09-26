import { useWalletConnect } from '../contexts/WalletConnectContext';
import {
  openWalletConnectModal,
  walletConnectWallet,
} from './walletConnectClient';
import type { WalletInterface } from './walletInterface';

export const useWalletInterface = (): WalletInterface => {
  const { accountId, isConnected, balance } = useWalletConnect();

  const actions = {
    connect: openWalletConnectModal,
    disconnect: walletConnectWallet.disconnect,
    executeContractFunction: walletConnectWallet.executeContractFunction,
  };

  return {
    accountId,
    isConnected,
    balance,
    actions,
  };
};
