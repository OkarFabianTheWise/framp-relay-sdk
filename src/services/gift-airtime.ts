import { Transaction } from "@solana/web3.js";
import axios from "axios";
import { AirtimeParams, TransactionResult } from "../types";

/**
 * Handles airtime gift transactions using AirbillsPay API
 * @param params Airtime transaction parameters
 * @param vendorUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Transaction details including ID for confirmation
 */
export async function Airtime(
  params: AirtimeParams,
  vendorUrl: string,
  secretKey: string
): Promise<TransactionResult> {
  const response = await axios.post(
    `${vendorUrl}/bills/airtime/paypoint`,
    {
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      token: params.token,
      fee: params.fee,
      user_address: params.userAddress
    },
    {
      headers: {
        secretkey: secretKey,
      },
    }
  );

  const data = response.data;
  const deserializedTransaction = Transaction.from(Buffer.from(data.ix, 'base64'));

  return {
    transaction: deserializedTransaction as any,
    txBase64: data.ix,
    id: data.id
  };
}

/**
 * Confirms an airtime transaction with AirbillsPay
 * @param id Transaction ID
 * @param vendorUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Confirmation result
 */
export async function confirmAirtimeTransaction(
  id: string,
  vendorUrl: string,
  secretKey: string
): Promise<any> {
  const response = await axios.post(
    `${vendorUrl}/bills/airtime/paypoint/complete`,
    { id },
    {
      headers: {
        secretkey: secretKey,
      },
    }
  );
  return response.data;
}