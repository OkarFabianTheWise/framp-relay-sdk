import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FrampRelayer } from "framp-relay-sdk";

const AIRBILLS_SECRET_KEY = import.meta.env.VITE_PUBLIC_AIRBILLS_SECRET_KEY;
const SOLSCAN_API_KEY = import.meta.env.VITE_PUBLIC_SOLSCAN_API_KEY;

const PAYMENT_TOKENS = [
  { symbol: "SOL", address: "So11111111111111111111111111111111111111112" },
  { symbol: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
];

export default function GiftToken() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payWith, setPayWith] = useState(PAYMENT_TOKENS[0].address);
  const [tokenToGift, setTokenToGift] = useState("");

  const { connection } = useConnection();
  const wallet = useWallet();

  const relayer = new FrampRelayer({
    solscanApiKey: SOLSCAN_API_KEY,
    airbillsSecretKey: AIRBILLS_SECRET_KEY,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !recipientAddress || amount <= 0) return;

    setIsProcessing(true);
    setMessage("");

    try {
      const result = await relayer.giftToken({
        walletPublicKey: wallet.publicKey,
        recipient: recipientAddress,
        amount,
        mintToPayWith: payWith,
        tokenMintToGift: tokenToGift || undefined, // Only include if specified
      });

      if (result.transaction) {
        if (!wallet.signTransaction) {
          throw new Error("Wallet does not support signing transactions");
        }

        const signedTx = await wallet.signTransaction(result.transaction);
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          { maxRetries: 5 }
        );

        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature,
          ...latestBlockhash,
        });

        setMessage("Token transfer successful! 🎉");
        setAmount(0);
        setRecipientAddress("");
        setTokenToGift("");
      }
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Gift Token</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Pay With</label>
            <select
              value={payWith}
              onChange={(e) => setPayWith(e.target.value)}
              className="w-full p-2 rounded bg-gray-800"
            >
              {PAYMENT_TOKENS.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">
              Token to Gift (SPL Token Address)
            </label>
            <input
              type="text"
              value={tokenToGift}
              onChange={(e) => setTokenToGift(e.target.value)}
              placeholder="Enter SPL token address"
              className="w-full p-2 rounded bg-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter recipient address"
              className="w-full p-2 rounded bg-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2">Amount</label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              step="any"
              className="w-full p-2 rounded bg-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={
              isProcessing ||
              !wallet.publicKey ||
              !recipientAddress ||
              amount <= 0
            }
            className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Send Gift"}
          </button>

          {message && (
            <div
              className={`text-center ${
                message.includes("successful")
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
