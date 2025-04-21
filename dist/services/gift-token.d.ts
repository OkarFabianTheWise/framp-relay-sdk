import { GiftParams, TransactionResult } from "../types";
/**
 * Handles token gift transactions using Jupiter Exchange
 * @param params Gift transaction parameters
 * @param jupiterQuoteUrl Jupiter API quote endpoint
 * @param jupiterSwapUrl Jupiter API swap endpoint
 * @returns Transaction details and base64 encoded transaction
 */
export declare function sendToken(params: GiftParams, jupiterQuoteUrl: string, jupiterSwapUrl: string): Promise<TransactionResult>;
