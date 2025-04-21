import { PublicKey, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { AirtimeParams, TransactionResult } from "../types";
import { fiatRouter } from "../utils/router";

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
  const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
  
  // Input validation
  if (!params.phoneNumber) throw new Error("Phone number is required");
  if (!params.amount) throw new Error("Amount is required");
  if (!params.userAddress) throw new Error("User address is required");
  if (!params.token) throw new Error("Token is required");

  let tokensymbol = 'USDC';
  let airtimeTransaction: Transaction;
  
  // If token is not USDC or USDT, create a swap transaction first
  if (params.token !== USDC && params.token !== USDT) {
    // Get quote from Jupiter for token -> USDC swap
    
    const swapResult = await fiatRouter({
      walletPublicKey: params.userAddress,
      amount: params.amount,
      tokenMint: params.token
    });


  // Create airtime transaction
  const airtimeResponse = await axios.post(
    `${vendorUrl}/bills/airtime/paypoint`,
    {
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      token: 'USDC',
      fee: params.fee,
      user_address: params.userAddress
    },
    {
      headers: { secretkey: secretKey }
    }
  );

  // Convert legacy Transaction to VersionedTransaction
  const legacyAirtimeTx = Transaction.from(Buffer.from(airtimeResponse.data.ix, 'base64'));
    
    // Convert CompiledInstructions to TransactionInstructions
    const swapInstructions = swapResult.transaction.message.compiledInstructions.map(ix => {
      return new TransactionInstruction({
        programId: new PublicKey(swapResult.transaction.message.staticAccountKeys[ix.programIdIndex]),
        keys: ix.accountKeyIndexes.map(index => ({
          pubkey: new PublicKey(swapResult.transaction.message.staticAccountKeys[index]),
          isSigner: false,
          isWritable: false
        })),
        data: Buffer.from(ix.data)
      });
    });
  
    // Combine instructions
    const instructions = [
      ...swapInstructions,
      ...legacyAirtimeTx.instructions
    ];

    if (!swapResult.transaction.message.recentBlockhash) {
      throw new Error("Missing recent blockhash");
    }

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(params.userAddress),
      recentBlockhash: swapResult.transaction.message.recentBlockhash,
      instructions
    }).compileToV0Message();

    const combinedTransaction = new VersionedTransaction(messageV0);

    return {
      transaction: combinedTransaction,
      txBase64: Buffer.from(combinedTransaction.serialize()).toString('base64'),
      id: airtimeResponse.data.id
    };
} else {
  // Original flow for USDC/USDT
  const response = await axios.post(
    `${vendorUrl}/bills/airtime/paypoint`,
    {
      phoneNumber: params.phoneNumber,
      amount: params.amount,
      token: tokensymbol,
      fee: params.fee,
      user_address: params.userAddress
    },
    {
      headers: { secretkey: secretKey }
    }
  );

  // Convert legacy Transaction to VersionedTransaction
  const legacyTx = Transaction.from(Buffer.from(response.data.ix, 'base64'));
    
    if (!legacyTx.recentBlockhash) {
      throw new Error("Missing recent blockhash");
    }

    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(params.userAddress),
      recentBlockhash: legacyTx.recentBlockhash,
      instructions: legacyTx.instructions
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(messageV0);

    return {
      transaction: versionedTransaction,
      txBase64: Buffer.from(versionedTransaction.serialize()).toString('base64'),
      id: response.data.id
    };
  }
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