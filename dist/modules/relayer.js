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
exports.FrampRelayer = void 0;
const gift_token_1 = require("../services/gift-token");
const gift_airtime_1 = require("../services/gift-airtime");
const axios_1 = __importDefault(require("axios"));
class FrampRelayer {
    constructor(config) {
        this.JUPITER_SWAP_URL = "https://quote-api.jup.ag/v6/swap";
        this.JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";
        this.solscanApiUrl = (config === null || config === void 0 ? void 0 : config.solscanApiUrl) || "https://pro-api.solscan.io/v2.0/transaction/detail";
        this.solscanApiKey = (config === null || config === void 0 ? void 0 : config.solscanApiKey) || process.env.SOLSCAN_API_KEY || "";
        this.timeout = (config === null || config === void 0 ? void 0 : config.timeout) || 60000;
        this.airbillsVendorUrl = (config === null || config === void 0 ? void 0 : config.airbillsVendorUrl) || "https://vendor.airbillspay.com";
        this.airbillsSecretKey = (config === null || config === void 0 ? void 0 : config.airbillsSecretKey) || process.env.AIRBILLS_SECRET_KEY || "";
    }
    giftToken(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, gift_token_1.sendToken)(params, this.JUPITER_QUOTE_URL, this.JUPITER_SWAP_URL);
        });
    }
    sendAirtime(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, gift_airtime_1.Airtime)(params, this.airbillsVendorUrl, this.airbillsSecretKey);
        });
    }
    payServiceFee(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, gift_token_1.sendToken)(params, this.JUPITER_QUOTE_URL, this.JUPITER_SWAP_URL);
        });
    }
    confirmAirtimeTransaction(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, gift_airtime_1.confirmAirtimeTransaction)(id, this.airbillsVendorUrl, this.airbillsSecretKey);
        });
    }
    /**
     * Verifies the status of a transaction using Solscan API
     * @param signature Transaction signature
     * @returns True if the transaction is successful, false otherwise
     *  */
    verifyTransactionStatus(signature) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield axios_1.default.get(this.solscanApiUrl, {
                    params: { tx: signature },
                    headers: {
                        'token': this.solscanApiKey
                    },
                    timeout: this.timeout
                });
                return response.data.success && ((_a = response.data.data) === null || _a === void 0 ? void 0 : _a.success);
            }
            catch (error) {
                console.error('Failed to verify transaction:', error);
                return false;
            }
        });
    }
}
exports.FrampRelayer = FrampRelayer;
