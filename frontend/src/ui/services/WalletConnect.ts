import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';
import type { SignClientTypes } from '@walletconnect/types';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('You need to provide VITE_WALLETCONNECT_PROJECT_ID in .env');
}

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
