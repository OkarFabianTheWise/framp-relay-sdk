import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export interface RelayerConfig {
  solscanApiKey?: string;
  solscanApiUrl?: string;
  timeout?: number;
  airbillsSecretKey?: string;
  airbillsVendorUrl?: string;
}

export interface GiftParams {
  walletPublicKey: PublicKey;
  recipient: string;
  amount: number;
  mintToPayWith?: string;
  tokenMintToGift?: string;
}

export interface RouterParams {
  walletPublicKey: string;
  amount: number;
  mintToPayWith: string;
}

export interface AirtimeParams {
  phoneNumber: string;
  amount: number;
  token: string;
  fee?: number;
  userAddress: string;
}

export interface TransactionResult {
  transaction: Transaction | VersionedTransaction | null;
  swapTransaction?: Transaction | VersionedTransaction;
  airtimeTransaction?: Transaction;
  txBase64: string;
  signature?: string;
  id?: string;
}