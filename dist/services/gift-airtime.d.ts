import { AirtimeParams, TransactionResult } from "../types";
/**
 * Handles airtime gift transactions using AirbillsPay API
 * @param params Airtime transaction parameters
 * @param baseUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Transaction details including ID for confirmation
 */
export declare function Airtime(params: AirtimeParams, baseUrl: string, secretKey: string): Promise<TransactionResult>;
/**
 * Confirms an airtime transaction with AirbillsPay
 * @param id Transaction ID
 * @param baseUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Confirmation result
 */
export declare function confirmAirtimeTransaction(id: string, baseUrl: string, secretKey: string): Promise<any>;
