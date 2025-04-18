"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGiftToken = sendGiftToken;
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";
const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
function sendGiftToken(_a) {
    return __awaiter(this, arguments, void 0, function* ({ walletPublicKey, recipient, amount, tokenMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
     }) {
        const inputMint = "So11111111111111111111111111111111111111112"; // SOL
        // Step 1: Get Quote
        const lamports = Math.floor(amount * 1e9);
        const quoteResp = yield axios_1.default.get(JUPITER_QUOTE_URL, {
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
        const swapResp = yield axios_1.default.post(JUPITER_SWAP_URL, swapPayload);
        const swapTxB64 = swapResp.data.swapTransaction;
        const swapTxBytes = Buffer.from(swapTxB64, "base64");
        const transaction = web3_js_1.VersionedTransaction.deserialize(swapTxBytes);
        return {
            transaction,
            txBase64: swapTxB64
        };
    });
}
