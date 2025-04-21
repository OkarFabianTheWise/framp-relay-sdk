import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import { RouterParams, TransactionResult } from "../types";
import { jupiterQuoteUrl, jupiterSwapUrl } from "../constants";

/**
 * Handles token gift transactions using Jupiter Exchange
 * @param params TokenRoute transaction parameters
 * @returns Transaction details and base64 encoded transaction
 */
export async function fiatRouter(
  params: RouterParams,
): Promise<TransactionResult> {
  const {
    walletPublicKey,
    amount,
    tokenMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  } = params;

  const inputMint = "So11111111111111111111111111111111111111112"; // SOL
  const lamports = Math.floor(amount * 1e9);

  const quoteResp = await axios.get(jupiterQuoteUrl, {
    params: {
      inputMint,
      outputMint: tokenMint,
      amount: lamports,
      slippageBps: 1000,
    },
  });

  const quote = quoteResp.data;
  const swapPayload = {
    userPublicKey: walletPublicKey,
    quoteResponse: quote,
    computeUnitPriceMicroLamports: 30000000,
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