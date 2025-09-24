export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
}

export interface WalletInterface {
  accountId: string | undefined;
  balance: string | null;
  isConnected: boolean;
  actions: WalletActions;
}
