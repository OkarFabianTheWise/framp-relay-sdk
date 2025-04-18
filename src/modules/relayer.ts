import {
    PublicKey,
    VersionedTransaction,
  } from "@solana/web3.js";
  import axios from "axios";
  
  export interface RelayerConfig {
    solscanApiKey?: string;
    solscanApiUrl?: string;
    timeout?: number;
  }
  
  export interface GiftParams {
    walletPublicKey: PublicKey;
    recipient: string;
    amount: number;
    tokenMint?: string;
  }
  
  export interface TransactionResult {
    transaction: VersionedTransaction;
    txBase64: string;
    signature?: string;
  }
  
  export class FrampRelayer {
    private readonly JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";
    private readonly JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
    private readonly solscanApiUrl: string;
    private readonly solscanApiKey: string;
    private readonly timeout: number;
  
    constructor(config?: RelayerConfig) {
      this.solscanApiUrl = config?.solscanApiUrl || "https://pro-api.solscan.io/v2.0/transaction/detail";
      this.solscanApiKey = config?.solscanApiKey || process.env.SOLSCAN_API_KEY || "";
      this.timeout = config?.timeout || 60000;
    }
  
    async sendGiftToken({
      walletPublicKey,
      recipient,
      amount,
      tokenMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    }: GiftParams): Promise<TransactionResult> {
      const inputMint = "So11111111111111111111111111111111111111112"; // SOL
      const lamports = Math.floor(amount * 1e9);
  
      const quoteResp = await axios.get(this.JUPITER_QUOTE_URL, {
        params: {
          inputMint,
          outputMint: tokenMint,
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
      };
  
      const swapResp = await axios.post(this.JUPITER_SWAP_URL, swapPayload);
      const swapTxB64 = swapResp.data.swapTransaction;
      const swapTxBytes = Buffer.from(swapTxB64, "base64");
      const transaction = VersionedTransaction.deserialize(swapTxBytes);
  
      return {
        transaction,
        txBase64: swapTxB64
      };
    }
  
    async verifyTransactionStatus(signature: string): Promise<boolean> {
      try {
        const response = await axios.get(this.solscanApiUrl, {
          params: { tx: signature },
          headers: {
            'token': this.solscanApiKey
          },
          timeout: this.timeout
        });
  
        return response.data.success && response.data.data?.success;
      } catch (error) {
        console.error('Failed to verify transaction:', error);
        return false;
      }
    }
  }