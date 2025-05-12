import axios from "axios";
import { RouterParams, TransactionResult, UltraErrorCode, UltraOrderResponse, UltraSwapError, UltraSwapResponse } from "../types";
import { ULTRA_API_BASE, REFERRAL_FEE_BPS, REFERRAL_ACCOUNT } from "../constants";
import { VersionedTransaction } from "@solana/web3.js";

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

  const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
  
  // Convert amount to proper format
  const conversionRate = 1600;
  const usdcAmount = amount / conversionRate;
  const amountInLamports = Math.floor(usdcAmount * 1e6);

  try {
    // Create order URL with parameters
    const orderUrl = new URL(`${ULTRA_API_BASE}/order`);
    orderUrl.searchParams.set('inputMint', mintToPayWith);
    orderUrl.searchParams.set('outputMint', outputMint);
    orderUrl.searchParams.set('amount', amountInLamports.toString());
    orderUrl.searchParams.set('taker', walletPublicKey);

    if (REFERRAL_ACCOUNT) {
      orderUrl.searchParams.set('referralAccount', REFERRAL_ACCOUNT);
      orderUrl.searchParams.set('referralFee', REFERRAL_FEE_BPS.toString());
    }

    // Get order
    const orderResponse = await axios.get<UltraOrderResponse>(orderUrl.toString());

    if (!orderResponse.data.transaction) {
      throw new Error('No transaction in order response');
    }

    const { transaction: txBase64, requestId } = orderResponse.data;

    // Create versioned transaction
    const transaction = VersionedTransaction.deserialize(
      Buffer.from(txBase64, 'base64')
    );

    // check if requestId is present
    if (!requestId) {
      throw new Error('No requestId in order response');
    }

    return {
      transaction: null, // Original transaction field kept for compatibility
      txBase64,
      swapTransaction: transaction,
      requestId // Added for Ultra API execution
    };
  } catch (error: any) {
    throw new Error(`Ultra swap error: ${error.message}`);
  }
}

export async function executeUltraSwap(
  signedTxBase64: string,
  requestId: string
): Promise<UltraSwapResponse> {
  try {
    const response = await axios.post(`${ULTRA_API_BASE}/execute`, {
      signedTransaction: signedTxBase64,
      requestId
    });

    return response.data;
  } catch (err: unknown) {
    const error = err as { response?: { data: UltraSwapError } };
    
    if (error.response?.data) {
      const { code, error: errorMessage } = error.response.data;
      
      switch (code) {
        // Ultra Endpoint Errors
        case UltraErrorCode.MISSING_CACHED_ORDER:
          throw new Error('Order expired or not found. Please create a new order.');
        case UltraErrorCode.INVALID_SIGNED_TRANSACTION:
          throw new Error('Invalid transaction signature. Please check wallet signing.');
        case UltraErrorCode.INVALID_MESSAGE_BYTES:
          throw new Error('Invalid transaction format. Please ensure correct transaction handling.');
          
        // Aggregator Swap Errors
        case UltraErrorCode.FAILED_TO_LAND:
          throw new Error('Transaction failed to complete on the network. Please try again.');
        case UltraErrorCode.INVALID_TRANSACTION:
          throw new Error('Invalid transaction structure. Please check transaction parameters.');
        case UltraErrorCode.TRANSACTION_NOT_SIGNED:
          throw new Error('Transaction is not fully signed. Please check wallet signing.');
          
        // RFQ Errors
        case UltraErrorCode.RFQ_QUOTE_EXPIRED:
          throw new Error('Quote expired. Please request a new quote.');
        case UltraErrorCode.RFQ_SWAP_REJECTED:
          throw new Error('Swap was rejected. Please try again or use a different route.');
          
        default:
          throw new Error(`Ultra swap execution error: ${errorMessage} (Code: ${code})`);
      }
    }
    
    throw new Error('Ultra swap execution failed with unknown error');
  }
}