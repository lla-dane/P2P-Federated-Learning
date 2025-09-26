import type { ContractId, Hbar } from '@hashgraph/sdk';
import type { ContractFunctionParameterBuilder } from './contractFunctionParameterBuilder';

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  executeContractFunction: (
    contractId: ContractId,
    functionName: string,
    functionParameters: ContractFunctionParameterBuilder,
    gasLimit: number,
    payableAmount: Hbar
  ) => Promise<string | null>;
}

export interface WalletInterface {
  accountId: string | undefined;
  balance: string | null;
  isConnected: boolean;
  actions: WalletActions;
}
