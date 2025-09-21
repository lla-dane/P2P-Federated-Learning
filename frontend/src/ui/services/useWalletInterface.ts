import { useWallet } from '../contexts/WalletConnectContext';

export const useWalletInterface = () => {
  const walletConnectCtx = useWallet();

  if (walletConnectCtx.accountId) {
    return {
      accountId: walletConnectCtx.accountId,
      balance: walletConnectCtx.balance,
      connect: walletConnectCtx.connect,
      disconnect: walletConnectCtx.disconnect,
    };
  }

  return {
    accountId: undefined,
    balance: null,
    connect: walletConnectCtx.connect,
    disconnect: walletConnectCtx.disconnect,
  };
};
