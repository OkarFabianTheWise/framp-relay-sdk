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
exports.fiatRouter = fiatRouter;
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
/**
 * Handles token gift transactions using Jupiter Exchange
 * @param params TokenRoute transaction parameters
 * @returns Transaction details and base64 encoded transaction
 */
function fiatRouter(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { walletPublicKey, amount, tokenMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
         } = params;
        const inputMint = "So11111111111111111111111111111111111111112"; // SOL
        const lamports = Math.floor(amount * 1e9);
        const quoteResp = yield axios_1.default.get(constants_1.jupiterQuoteUrl, {
            params: {
                inputMint,
                outputMint: tokenMint,
                amount: lamports,
                slippageBps: 1000,
            },
        });
        const quote = quoteResp.data;
        const swapPayload = {
            userPublicKey: walletPublicKey,
            quoteResponse: quote,
            computeUnitPriceMicroLamports: 30000000,
            useVersionedTransaction: false,
        };
        const swapResp = yield axios_1.default.post(constants_1.jupiterSwapUrl, swapPayload);
        const swapTxB64 = swapResp.data.swapTransaction;
        const swapTxBytes = Buffer.from(swapTxB64, "base64");
        // Change to Legacy Transaction
        const transaction = web3_js_1.Transaction.from(swapTxBytes);
        return {
            transaction,
            txBase64: swapTxB64
        };
    });
}
