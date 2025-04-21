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
/**
 * Handles airtime gift transactions using AirbillsPay API
 * @param params Airtime transaction parameters
 * @param vendorUrl AirbillsPay vendor URL
 * @param secretKey AirbillsPay secret key
 * @returns Transaction details including ID for confirmation
 */
function Airtime(params, vendorUrl, secretKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post(`${vendorUrl}/bills/airtime/paypoint`, {
            phoneNumber: params.phoneNumber,
            amount: params.amount,
            token: params.token,
            fee: params.fee,
            user_address: params.userAddress
        }, {
            headers: {
                secretkey: secretKey,
            },
        });
        const data = response.data;
        const deserializedTransaction = web3_js_1.Transaction.from(Buffer.from(data.ix, 'base64'));
        return {
            transaction: deserializedTransaction,
            txBase64: data.ix,
            id: data.id
        };
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
