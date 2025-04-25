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
 * @param baseUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Transaction details including ID for confirmation
 */
function Airtime(params, baseUrl, secretKey) {
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
        // For non-USDC/USDT tokens
        if (params.token !== USDC && params.token !== USDT) {
            const swapResult = yield (0, router_1.fiatRouter)({
                walletPublicKey: params.userAddress,
                amount: params.amount,
                mintToPayWith: params.token,
            });
            const airtimeResponse = yield axios_1.default.post(`${baseUrl}/airtime/paypoint`, {
                phoneNumber: params.phoneNumber,
                amount: params.amount,
                token: 'USDC',
                fee: params.fee,
                user_address: params.userAddress
            }, {
                headers: { secretkey: secretKey }
            });
            // Deserialize both transactions
            const swapTx = web3_js_1.VersionedTransaction.deserialize(Buffer.from(swapResult.txBase64, 'base64'));
            const airtimeTx = web3_js_1.Transaction.from(Buffer.from(airtimeResponse.data.ix, 'base64'));
            // Create a new transaction starting with the airtime transaction
            const combinedTx = airtimeTx; // This preserves the partial signatures
            // Set the blockhash from the swap transaction
            combinedTx.recentBlockhash = swapTx.message.recentBlockhash;
            // Copy swap transaction instructions to the beginning
            swapTx.message.compiledInstructions.reverse().forEach(ix => {
                const instruction = new web3_js_1.TransactionInstruction({
                    programId: swapTx.message.staticAccountKeys[ix.programIdIndex],
                    keys: ix.accountKeyIndexes.map(index => ({
                        pubkey: swapTx.message.staticAccountKeys[index],
                        isSigner: swapTx.message.isAccountSigner(index),
                        isWritable: swapTx.message.isAccountWritable(index)
                    })),
                    data: Buffer.from(ix.data)
                });
                // Add swap instructions at the beginning
                combinedTx.instructions.unshift(instruction);
            });
            // Copy airtime transaction instructions
            airtimeTx.instructions.forEach(ix => {
                combinedTx.add(ix);
            });
            return {
                transaction: combinedTx,
                txBase64: combinedTx.serialize({
                    verifySignatures: false,
                    requireAllSignatures: false
                }).toString('base64'),
                id: airtimeResponse.data.id
            };
        }
        // For USDC/USDT direct transactions
        const response = yield axios_1.default.post(`${baseUrl}/airtime/paypoint`, {
            phoneNumber: params.phoneNumber,
            amount: params.amount,
            token: tokensymbol,
            fee: params.fee,
            user_address: params.userAddress
        }, {
            headers: { secretkey: secretKey }
        });
        const transaction = web3_js_1.Transaction.from(Buffer.from(response.data.ix, 'base64'));
        return {
            transaction,
            txBase64: transaction.serialize({
                verifySignatures: false,
                requireAllSignatures: false
            }).toString('base64'),
            id: response.data.id
        };
    });
}
/**
 * Confirms an airtime transaction with AirbillsPay
 * @param id Transaction ID
 * @param baseUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Confirmation result
 */
function confirmAirtimeTransaction(id, baseUrl, secretKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post(`${baseUrl}/airtime/paypoint/complete`, { id }, {
            headers: {
                secretkey: secretKey,
            },
        });
        return response.data;
    });
}
