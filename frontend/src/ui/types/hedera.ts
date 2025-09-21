export interface HederaWalletInterface {
  accountId: string | null;
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  transferFungibleToken(
    to: string,
    tokenId: string,
    amount: number
  ): Promise<void>;
  transferNonFungibleToken(
    to: string,
    tokenId: string,
    serialNumber: number
  ): Promise<void>;
  associateToken(tokenId: string): Promise<void>;
}
