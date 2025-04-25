import { PublicKey, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { AirtimeParams, TransactionResult } from "../types";
import { fiatRouter } from "../utils/router";

/**
 * Handles airtime gift transactions using AirbillsPay API
 * @param params Airtime transaction parameters
 * @param baseUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Transaction details including ID for confirmation
 */
export async function Airtime(
  params: AirtimeParams,
  baseUrl: string,
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
  
  // For non-USDC/USDT tokens
  if (params.token !== USDC && params.token !== USDT) {
    const swapResult = await fiatRouter({
      walletPublicKey: params.userAddress,
      amount: params.amount,
      mintToPayWith: params.token,
    });

    const airtimeResponse = await axios.post(
      `${baseUrl}/airtime/paypoint`,
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

    // Deserialize both transactions
    const swapTx = VersionedTransaction.deserialize(Buffer.from(swapResult.txBase64, 'base64'));
    const airtimeTx = Transaction.from(Buffer.from(airtimeResponse.data.ix, 'base64'));

    // Create a new transaction and combine instructions
    const combinedTx = new Transaction();
    
    // Set the recent blockhash and fee payer
    combinedTx.recentBlockhash = swapTx.message.recentBlockhash;
    // combinedTx.feePayer = new PublicKey(params.userAddress);
    
    // Copy swap transaction instructions
    swapTx.message.compiledInstructions.forEach(ix => {
      const instruction = new TransactionInstruction({
        programId: swapTx.message.staticAccountKeys[ix.programIdIndex],
        keys: ix.accountKeyIndexes.map(index => ({
          pubkey: swapTx.message.staticAccountKeys[index],
          isSigner: swapTx.message.isAccountSigner(index),
          isWritable: swapTx.message.isAccountWritable(index)
        })),
        data: Buffer.from(ix.data)
      });
      combinedTx.add(instruction);
    });

    // Copy airtime transaction instructions
    airtimeTx.instructions.forEach(ix => {
      combinedTx.add(ix);
    });

    return {
      transaction: combinedTx,
      txBase64: combinedTx.serialize({
        verifySignatures: false,
        requireAllSignatures: false
      }).toString('base64'),
      id: airtimeResponse.data.id
    };
  }
  
  // For USDC/USDT direct transactions
  const response = await axios.post(
    `${baseUrl}/airtime/paypoint`,
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

  const transaction = Transaction.from(Buffer.from(response.data.ix, 'base64'));

  return {
    transaction,
    txBase64: transaction.serialize({
      verifySignatures: false,
      requireAllSignatures: false
    }).toString('base64'),
    id: response.data.id
  };
}

/**
 * Confirms an airtime transaction with AirbillsPay
 * @param id Transaction ID
 * @param baseUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Confirmation result
 */
export async function confirmAirtimeTransaction(
  id: string,
  baseUrl: string,
  secretKey: string
): Promise<any> {
  const response = await axios.post(
    `${baseUrl}/airtime/paypoint/complete`,
    { id },
    {
      headers: {
        secretkey: secretKey,
      },
    }
  );
  return response.data;
}