import { RouterParams, TransactionResult } from "../types";
/**
 * Handles token gift transactions using Jupiter Exchange
 * @param params TokenRoute transaction parameters
 * @returns Transaction details and base64 encoded transaction
 */
export declare function fiatRouter(params: RouterParams): Promise<TransactionResult>;
