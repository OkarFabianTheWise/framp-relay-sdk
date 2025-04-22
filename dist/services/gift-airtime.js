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
exports.Airtime = Airtime;
exports.confirmAirtimeTransaction = confirmAirtimeTransaction;
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const router_1 = require("../utils/router");
/**
 * Handles airtime gift transactions using AirbillsPay API
 * @param params Airtime transaction parameters
 * @param vendorUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Transaction details including ID for confirmation
 */
function Airtime(params, vendorUrl, secretKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
        // Input validation
        if (!params.phoneNumber)
            throw new Error("Phone number is required");
        if (!params.amount)
            throw new Error("Amount is required");
        if (!params.userAddress)
            throw new Error("User address is required");
        if (!params.token)
            throw new Error("Token is required");
        let tokensymbol = 'USDC';
        // If token is not USDC or USDT, create a swap transaction first
        if (params.token !== USDC && params.token !== USDT) {
            // Get quote from Jupiter for token -> USDC swap
            const swapResult = yield (0, router_1.fiatRouter)({
                walletPublicKey: params.userAddress,
                amount: params.amount,
                tokenMint: params.token
            });
            // Create airtime transaction
            const airtimeResponse = yield axios_1.default.post(`${vendorUrl}/bills/airtime/paypoint`, {
                phoneNumber: params.phoneNumber,
                amount: params.amount,
                token: 'USDC',
                fee: params.fee,
                user_address: params.userAddress
            }, {
                headers: { secretkey: secretKey }
            });
            // Convert legacy Transaction to VersionedTransaction
            const legacyAirtimeTx = web3_js_1.Transaction.from(Buffer.from(airtimeResponse.data.ix, 'base64'));
            // Convert CompiledInstructions to TransactionInstructions
            const swapInstructions = swapResult.transaction.message.compiledInstructions.map(ix => {
                return new web3_js_1.TransactionInstruction({
                    programId: new web3_js_1.PublicKey(swapResult.transaction.message.staticAccountKeys[ix.programIdIndex]),
                    keys: ix.accountKeyIndexes.map(index => ({
                        pubkey: new web3_js_1.PublicKey(swapResult.transaction.message.staticAccountKeys[index]),
                        isSigner: false,
                        isWritable: false
                    })),
                    data: Buffer.from(ix.data)
                });
            });
            // Combine instructions
            const instructions = [
                ...swapInstructions,
                ...legacyAirtimeTx.instructions
            ];
            if (!swapResult.transaction.message.recentBlockhash) {
                throw new Error("Missing recent blockhash");
            }
            const messageV0 = new web3_js_1.TransactionMessage({
                payerKey: new web3_js_1.PublicKey(params.userAddress),
                recentBlockhash: swapResult.transaction.message.recentBlockhash,
                instructions
            }).compileToV0Message();
            const combinedTransaction = new web3_js_1.VersionedTransaction(messageV0);
            return {
                transaction: combinedTransaction,
                txBase64: Buffer.from(combinedTransaction.serialize()).toString('base64'),
                id: airtimeResponse.data.id
            };
        }
        else {
            // Original flow for USDC/USDT
            const response = yield axios_1.default.post(`${vendorUrl}/bills/airtime/paypoint`, {
                phoneNumber: params.phoneNumber,
                amount: params.amount,
                token: tokensymbol,
                fee: params.fee,
                user_address: params.userAddress
            }, {
                headers: { secretkey: secretKey }
            });
            // Convert legacy Transaction to VersionedTransaction
            const legacyTx = web3_js_1.Transaction.from(Buffer.from(response.data.ix, 'base64'));
            if (!legacyTx.recentBlockhash) {
                throw new Error("Missing recent blockhash");
            }
            const messageV0 = new web3_js_1.TransactionMessage({
                payerKey: new web3_js_1.PublicKey(params.userAddress),
                recentBlockhash: legacyTx.recentBlockhash,
                instructions: legacyTx.instructions
            }).compileToV0Message();
            const versionedTransaction = new web3_js_1.VersionedTransaction(messageV0);
            return {
                transaction: versionedTransaction,
                txBase64: Buffer.from(versionedTransaction.serialize()).toString('base64'),
                id: response.data.id
            };
        }
    });
}
/**
 * Confirms an airtime transaction with AirbillsPay
 * @param id Transaction ID
 * @param vendorUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Confirmation result
 */
function confirmAirtimeTransaction(id, vendorUrl, secretKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post(`${vendorUrl}/bills/airtime/paypoint/complete`, { id }, {
            headers: {
                secretkey: secretKey,
            },
        });
        return response.data;
    });
}
