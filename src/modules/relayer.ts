import { VersionedTransaction } from "@solana/web3.js";
import { RelayerConfig, GiftParams, AirtimeParams, TransactionResult } from "../types";
import { sendToken } from "../services/gift-token";
import { Airtime, confirmAirtimeTransaction } from "../services/gift-airtime";
import axios from "axios";

export class FrampRelayer {
  private readonly JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";
  private readonly JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
  private readonly solscanApiUrl: string;
  private readonly solscanApiKey: string;
  private readonly timeout: number;
  private readonly airbillsVendorUrl: string;
  private readonly airbillsSecretKey: string;

  constructor(config?: RelayerConfig) {
    this.solscanApiUrl = config?.solscanApiUrl || "https://pro-api.solscan.io/v2.0/transaction/detail";
    this.solscanApiKey = config?.solscanApiKey || process.env.SOLSCAN_API_KEY || "";
    this.timeout = config?.timeout || 60000;
    this.airbillsVendorUrl = config?.airbillsVendorUrl || "https://vendor.airbillspay.com";
    this.airbillsSecretKey = config?.airbillsSecretKey || process.env.AIRBILLS_SECRET_KEY || "";
  }

  async giftToken(params: GiftParams): Promise<TransactionResult> {
    return sendToken(params, this.JUPITER_QUOTE_URL, this.JUPITER_SWAP_URL);
  }

  async sendAirtime(params: AirtimeParams): Promise<TransactionResult> {
    return Airtime(params, this.airbillsVendorUrl, this.airbillsSecretKey);
  }

  async payServiceFee(params: GiftParams): Promise<TransactionResult> {
    return sendToken(params, this.JUPITER_QUOTE_URL, this.JUPITER_SWAP_URL);
  }

  async confirmAirtimeTransaction(id: string): Promise<any> {
    return confirmAirtimeTransaction(id, this.airbillsVendorUrl, this.airbillsSecretKey);
  }

  /**
   * Verifies the status of a transaction using Solscan API 
   * @param signature Transaction signature
   * @returns True if the transaction is successful, false otherwise
   *  */
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