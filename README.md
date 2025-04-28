# 🛰️ Framp Relay SDK

A powerful SDK that simplifies complex token operations into **single atomic transactions** on Solana. Whether you're **gifting tokens you don't own**, **accessing token-gated services**, or **buying airtime with any token** – Framp Relay handles the complexity for you.

---

## 🎯 Key Solutions

### 🎁 Effortless Token Gifting

Send **any SPL token** to a friend—even if you don’t currently own it.

```ts
// Gift 1000 PEPE tokens using just SOL or USDC
await relayer.giftToken({
  walletPublicKey: "sender's address";
  recipient: "receiver";
  amount: "tokenMintToGift amount";
  mintToPayWith?: "any spl token";
  tokenMintToGift?: "token you want to send that you don't own.";
});
```

---

### 🔑 One-Click Service Access

Access token-gated services **without manually swapping tokens**.

```ts
// Pay for a service that requires ACCESS_TOKEN
await relayer.payServiceFee({
  walletPublicKey: yourWallet,
  recipient: serviceAddress,
  amount: servicePrice,
  tokenMint: ACCESS_TOKEN_MINT
});
```

---

### 📱 Direct Airtime Purchase

Purchase airtime **instantly** with your favorite token.

```ts
await relayer.sendAirtime({
  phoneNumber: "1234567890",
  amount: 100, // In naira not USDC or Lamports
  token: "ANY SPL TOKEN",
  userAddress: "yourWallet"
});
```

---

## 🚀 What Makes It Special

- ✨ **Single-Transaction Magic** — No more chaining swaps and transfers
- 🧠 **Token-Agnostic** — Pay with what you have, deliver what’s needed
- 🏦 **Best Rates** — Powered by [Jupiter](https://x.com/jupiterExchange) for optimal routing
- 🛡️ **Transaction Certainty** — Verified via [Solscan](https://solscan.io) for reliability
- 🪄 **Zero Token Holdings Required** — Gift or pay with tokens you don’t own

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

// Initialize with configuration
const relayer = new FrampRelayer({
  solscanApiKey: 'your-solscan-api-key',
  airbillsSecretKey: 'your-airbills-secret-key'
});

const walletPublicKey = new PublicKey('your-wallet-address');
const recipient = 'recipient-address';
const amount = 100; // in token units (not lamports)

async function sendAndVerify() {
  const txResult = await relayer.giftToken({
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

Solscan powers reliable, external verification:

- ✅ Confirm transaction success independently of RPCs  
- 🧾 Access rich transaction data  
- 🚀 Production-grade performance  

---

## 💡 Use Cases

### 1. One-Click Token Payments

```ts
const txResult = await relayer.giftToken({
  walletPublicKey: userWallet,
  recipient: merchantAddress,
  amount: 100,
  tokenMint: ACCESS_TOKEN_MINT
});
```

---

### 2. Automated Token Swapping

```ts
async function handleCheckout(amount: number) {
  const tx = await relayer.giftToken({
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

```ts
async function acceptPayment(amountInUSDC: number) {
  const tx = await relayer.giftToken({
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
  const txResult = await relayer.giftToken({ 
    walletPublicKey, 
    recipient, 
    amount 
  });

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
  solscanApiUrl?: string;    // Optional custom Solscan endpoint
  timeout?: number;          // Verification timeout in ms
}
```

---

## 🧠 Best Practices

- ✅ Always verify transactions with `verifyTransactionStatus`
- 🕒 Handle timeouts and retries gracefully
- 🧾 Store signatures for future reference
- ❌ Don’t assume RPCs alone are enough

---

## 📉 Rate Limits

- 🚫 Respect Solscan API limits  
- 📦 Queue high-volume requests  
- 💾 Cache verification results where applicable  

---

## 📚 Resources

- 🔗 [Framp Relay GitHub Repository](https://github.com/OkarFabianTheWise/framp-relay-sdk)
- 💬 [Join the Community](https://t.me/fiatrouter)
- 🛠️ Built for the **Solana** ecosystem, powered by [Jupiter Aggregator](https://jup.ag) and [Solscan](https://solscan.io)  
- ⚡ [Jupiter on X](https://x.com/jupiterExchange)
- ⚡ [Fiatrouter on X](https://x.com/fiatrouter)