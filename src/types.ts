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
  requestId?: string;
  error?: string;
  errorMessage?: string;
}

export interface UltraSwapResponse {
  status: 'Success' | 'Failed';
  signature?: string;
  error?: string;
}

export interface UltraOrderResponse {
  transaction: string;
  requestId: string;
}

export interface UltraSwapError {
  status: 'Failed';
  signature?: string;
  error: string;
  code: number;
  slot?: string;
}

export enum UltraErrorCode {
  // Ultra Endpoint Codes
  MISSING_CACHED_ORDER = -1,
  INVALID_SIGNED_TRANSACTION = -2,
  INVALID_MESSAGE_BYTES = -3,
  
  // Aggregator Swap Type Codes
  FAILED_TO_LAND = -1000,
  UNKNOWN_ERROR = -1001,
  INVALID_TRANSACTION = -1002,
  TRANSACTION_NOT_SIGNED = -1003,
  INVALID_BLOCK_HEIGHT = -1004,
  
  // RFQ Swap Type Codes
  RFQ_FAILED_TO_LAND = -2000,
  RFQ_UNKNOWN_ERROR = -2001,
  RFQ_INVALID_PAYLOAD = -2002,
  RFQ_QUOTE_EXPIRED = -2003,
  RFQ_SWAP_REJECTED = -2004
}