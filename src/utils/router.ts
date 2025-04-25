import { Transaction } from "@solana/web3.js";
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
    mintToPayWith
  } = params;

  const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  // params.amount is in Naira, convert to USDC equivalent
  // 1 USDC = 1600 Naira (example conversion rate, adjust as needed) 
  // Convert Naira to USDC equivalent
  const conversionRate = 1600; // conversion rate
  const usdcAmount = amount / conversionRate;
  const usdcAmountInLamports = Math.floor(usdcAmount * 1e6); // Convert to lamports

  // Get first quote for USDC to params.token swap to ascertain the amount of params.token to send
  const initalquoteResponse = await axios.get(jupiterQuoteUrl, {
    params: {
      inputMint: USDC,
      outputMint: mintToPayWith,
      amount: usdcAmountInLamports,
      slippageBps: 1000,
    },
  });

  const initialQuote = initalquoteResponse.data;
  // console.log("Initial Quote:", initialQuote);
  const lamports = initialQuote.outAmount; // extract the outAmount from the quote
  // console.log("Lamports:", lamports);

  const quoteResp = await axios.get(jupiterQuoteUrl, {
    params: {
      inputMint: mintToPayWith,
      outputMint: outputMint,
      amount: lamports,
      slippageBps: 1000,
    },
  });

  const quote = quoteResp.data;
  const swapPayload = {
    userPublicKey: walletPublicKey,
    quoteResponse: quote,
    computeUnitPriceMicroLamports: 30000000,
    asLegacyTransaction: true,
  };

  const swapResp = await axios.post(jupiterSwapUrl, swapPayload);
  const swapTxB64 = swapResp.data.swapTransaction;
  const swapTxBytes = Buffer.from(swapTxB64, "base64");

  let transaction;

  // Deserialize the transaction
  transaction = Transaction.from(swapTxBytes);
  return {
    transaction,
    txBase64: swapTxB64
  };
}