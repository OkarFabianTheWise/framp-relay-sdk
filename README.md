# 🛰️ Framp Relay SDK

A seamless SDK for **token swapping and gifting** on Solana, with **transaction verification** powered by [Solscan](https://solscan.io). The Framp Relay SDK simplifies complex token flows into single atomic actions.

---

## 🚀 Overview

The **Framp Relay SDK** enables developers to:

- Swap tokens using the best rates via the **Jupiter Aggregator**
- Send tokens across wallets in one transaction
- Verify transactions using **Solscan API** as the source of truth

All while supporting **any SPL token** and providing **TypeScript support** out of the box.

---

## ✨ Features

- ✅ One-step token **swapping + sending**
- 🔄 Integrated with **Jupiter API** for optimal swap routes
- 🔍 Transaction verification via **Solscan**
- 💸 Supports **all SPL tokens**
- 🧠 Fully typed with **TypeScript**

---

## 📦 Installation

```bash
npm install framp-relay-sdk
```

---

## 🧪 Basic Usage

```ts
import { FrampRelayer } from 'framp-relay-sdk';
import { PublicKey } from '@solana/web3.js';

// Initialize the relayer
const relayer = new FrampRelayer({
  solscanApiKey: 'your-solscan-api-key'
});

const walletPublicKey = new PublicKey('your-wallet-address');
const recipient = 'recipient-address';
const amount = 100; // in token units (not lamports)

async function sendAndVerify() {
  const txResult = await relayer.sendGiftToken({
    walletPublicKey,
    recipient,
    amount,
    tokenMint: 'ACCESS_TOKEN_MINT' // Optional (defaults to USDC)
  });

  const isSuccess = await relayer.verifyTransactionStatus(txResult.signature);
  console.log(`Transaction ${isSuccess ? 'successful' : 'failed'}`);
}
```

---

## 🔐 Source of Truth: Solscan Integration

Solscan is used for verifying transaction status, providing:

- ✅ Independent confirmation outside RPC nodes
- 🧾 Access to detailed transaction data
- 🚀 High reliability for production environments

---

## 💡 Use Cases

### 1. One-Click Token Payments

Send tokens in a single transaction—even if the user doesn't hold the correct token.

```ts
const txResult = await relayer.sendGiftToken({
  walletPublicKey: userWallet,
  recipient: merchantAddress,
  amount: 100,
  tokenMint: ACCESS_TOKEN_MINT
});
```

---

### 2. Automated Token Swapping

Use in checkout flows to simplify token acceptance.

```ts
async function handleCheckout(amount: number) {
  const tx = await relayer.sendGiftToken({
    walletPublicKey: customerWallet,
    recipient: merchantWallet,
    amount,
    tokenMint: ACCESS_TOKEN_MINT
  });

  const success = await relayer.verifyTransactionStatus(tx.signature);
  if (success) completeOrder();
}
```

---

### 3. Cross-Token Payments

Accept payments in any token (e.g., receive USDC even if user pays with something else).

```ts
async function acceptPayment(amountInUSDC: number) {
  const tx = await relayer.sendGiftToken({
    walletPublicKey: payerWallet,
    recipient: yourWallet,
    amount: amountInUSDC,
    tokenMint: USDC_MINT
  });
}
```

---

## ⚠️ Error Handling

```ts
try {
  const txResult = await relayer.sendGiftToken({ walletPublicKey, recipient, amount });

  const isConfirmed = await relayer.verifyTransactionStatus(txResult.signature);
  if (!isConfirmed) {
    throw new Error('Transaction failed on-chain');
  }
} catch (error) {
  console.error('Transaction failed:', error);
}
```

---

## ⚙️ Configuration Options

```ts
interface RelayerConfig {
  solscanApiKey?: string;    // Your Solscan API key
  solscanApiUrl?: string;    // Optional custom API endpoint
  timeout?: number;          // Max wait time for verification (in ms)
}
```

---

## 🧠 Best Practices

- Always call `verifyTransactionStatus` after sending tokens.
- Implement retry logic and handle network errors gracefully.
- Be mindful of rate limits for external APIs.

---

## 📉 Rate Limits

- Respect Solscan API rate limits.
- Use caching or queuing for high-frequency apps.
- Batch verification requests where possible.

---

## 📚 Resources

- 🔗 [Framp Relay GitHub Repository](https://github.com/OkarFabianTheWise/framp-relay-sdk)
- 💬 [Join the Community](https://t.me/fiatrouter)
- 🛠️ Built for the Solana ecosystem, powered by [Jupiter Aggregator](https://jup.ag) and [Solscan](https://solscan.io)