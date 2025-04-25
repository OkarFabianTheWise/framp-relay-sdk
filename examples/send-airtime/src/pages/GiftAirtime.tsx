import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FrampRelayer } from "framp-relay-sdk";
import { Transaction } from "@solana/web3.js";

const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY;
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY;

export default function SendAirtime() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const relayer = new FrampRelayer({
    solscanApiKey: SOLSCAN_API_KEY,
    airbillsSecretKey: AIRBILLS_SECRET_KEY,
  });

  // 7. Poll for transaction status
  const pollTransactionStatus = async (txId: string) => {
    const maxAttempts = 3; // 1 minute total (3 * 5 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await relayer.confirmAirtimeTransaction(txId);
        console.log(`Poll attempt ${attempts + 1}:`, status);

        if (status?.success) {
          setMessage("Airtime sent successfully! 🎉");
          return status;
        } else if (!status?.success) {
          throw new Error("Airtime transaction failed");
        }

        // Wait 5 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error("Polling error:", error);
        throw error;
      }
    }

    throw new Error("Transaction status check timed out");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !phoneNumber || amount <= 0) return;

    setIsProcessing(true);
    setMessage("");
    console.log("Sending airtime...");

    try {
      const result = await relayer.sendAirtime({
        phoneNumber,
        amount,
        token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        userAddress: wallet.publicKey.toString(),
      });

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");

      if (result.swapTransaction && result.airtimeTransaction) {
        // Handle non-USDC/USDT case (token swap needed)
        if (!wallet.signTransaction) {
          throw new Error("Wallet does not support transaction signing");
        }

        // Sign and send swap transaction first
        const signedSwap = await wallet.signTransaction(result.swapTransaction);
        const swapSig = await connection.sendRawTransaction(
          signedSwap.serialize(),
          { maxRetries: 5 }
        );

        console.log("Swap transaction sent:", swapSig);

        // Wait for swap confirmation
        const swapConfirmation = await connection.confirmTransaction(
          {
            signature: swapSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (swapConfirmation.value.err) {
          throw new Error(
            `Swap transaction failed: ${swapConfirmation.value.err}`
          );
        }

        // Sign and send airtime transaction
        const signedAirtime = await wallet.signTransaction(
          result.airtimeTransaction
        );
        const airtimeSig = await connection.sendRawTransaction(
          signedAirtime.serialize(),
          { maxRetries: 5 }
        );

        console.log("Airtime transaction sent:", airtimeSig);

        // Wait for airtime confirmation
        const airtimeConfirmation = await connection.confirmTransaction(
          {
            signature: airtimeSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (airtimeConfirmation.value.err) {
          throw new Error(
            `Airtime transaction failed: ${airtimeConfirmation.value.err}`
          );
        }
      } else {
        // Handle direct USDC/USDT transaction
        const transaction = Transaction.from(
          Buffer.from(result.txBase64, "base64")
        );

        if (!wallet.signTransaction) {
          throw new Error("Wallet does not support transaction signing");
        }

        const signed = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signed.serialize(),
          { maxRetries: 5 }
        );

        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
      }

      // Handle transaction completion
      if (!result?.id) {
        throw new Error("Transaction ID not found in response");
      }

      // Update UI and check status
      setMessage("Airtime sent successfully! 🎉");
      const relayStatus = await pollTransactionStatus(result.id);
      console.log("Relay status:", relayStatus);
    } catch (error) {
      console.error("Airtime gift error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to send airtime. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-center">Send Airtime</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, ""))
              }
              className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block mb-2">Amount (in naira eg. 200)</label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              placeholder="0.0"
              step="0.01"
            />
          </div>

          <button
            type="submit"
            disabled={
              isProcessing || !wallet.publicKey || !phoneNumber || amount <= 0
            }
            className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "Processing..." : "Send Airtime"}
          </button>

          {message && (
            <div
              className={`text-center mt-4 ${
                message.includes("successfully")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
