import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { GiftParams, TransactionResult } from "../types";

/**
 * Handles token gift transactions using Jupiter Exchange
 * @param params Gift transaction parameters
 * @param jupiterQuoteUrl Jupiter API quote endpoint
 * @param jupiterSwapUrl Jupiter API swap endpoint
 * @returns Transaction details and base64 encoded transaction
 */
export async function sendToken(
  params: GiftParams,
  jupiterQuoteUrl: string,
  jupiterSwapUrl: string
): Promise<TransactionResult> {
  const {
    walletPublicKey,
    recipient,
    amount,
    mintToPayWith,
    tokenMintToGift,
  } = params;

  const lamports = Math.floor(amount * 1e9);

  const quoteResp = await axios.get(jupiterQuoteUrl, {
    params: {
      inputMint: mintToPayWith,
      outputMint: tokenMintToGift,
      amount: lamports,
      slippageBps: 1000,
    },
  });

  const quote = quoteResp.data;
  const swapPayload = {
    userPublicKey: walletPublicKey.toBase58(),
    quoteResponse: quote,
    destinationTokenAccount: recipient,
    computeUnitPriceMicroLamports: 30000000,
    useVersionedTransaction: false
  };

  const swapResp = await axios.post(jupiterSwapUrl, swapPayload);
  const swapTxB64 = swapResp.data.swapTransaction;
  const swapTxBytes = Buffer.from(swapTxB64, "base64");
  const transaction = VersionedTransaction.deserialize(swapTxBytes);

  return {
    transaction,
    txBase64: swapTxB64
  };
}