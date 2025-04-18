import {
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";

export interface GiftParams {
  walletPublicKey: PublicKey;
  recipient: string;
  amount: number; // in tokens (not lamports)
  tokenMint?: string; // defaults to USDC
}

const JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";
const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";

export async function sendGiftToken({
  walletPublicKey,
  recipient,
  amount,
  tokenMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
}: GiftParams): Promise<{ transaction: VersionedTransaction, txBase64: string }> {
  const inputMint = "So11111111111111111111111111111111111111112"; // SOL

  // Step 1: Get Quote
  const lamports = Math.floor(amount * 1e9);

  const quoteResp = await axios.get(JUPITER_QUOTE_URL, {
      params: {
          inputMint,
          outputMint: tokenMint,
          amount: lamports,
          slippageBps: 1000,
      },
  });

  const quote = quoteResp.data;

  // Step 2: Prepare swap payload
  const swapPayload = {
      userPublicKey: walletPublicKey.toBase58(),
      quoteResponse: quote,
      destinationTokenAccount: recipient,
      computeUnitPriceMicroLamports: 30000000,
  };

  // Step 3: Get unsigned transaction
  const swapResp = await axios.post(JUPITER_SWAP_URL, swapPayload);
  const swapTxB64 = swapResp.data.swapTransaction;

  const swapTxBytes = Buffer.from(swapTxB64, "base64");
  const transaction = VersionedTransaction.deserialize(swapTxBytes);

  return {
      transaction,
      txBase64: swapTxB64
  };
}