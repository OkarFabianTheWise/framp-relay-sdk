import { RelayerConfig, GiftParams, AirtimeParams, TransactionResult } from "../types";
export declare class FrampRelayer {
    private readonly JUPITER_SWAP_URL;
    private readonly JUPITER_QUOTE_URL;
    private readonly solscanApiUrl;
    private readonly solscanApiKey;
    private readonly timeout;
    private readonly airbillsVendorUrl;
    private readonly airbillsSecretKey;
    constructor(config?: RelayerConfig);
    giftToken(params: GiftParams): Promise<TransactionResult>;
    sendAirtime(params: AirtimeParams): Promise<TransactionResult>;
    payServiceFee(params: GiftParams): Promise<TransactionResult>;
    confirmAirtimeTransaction(id: string): Promise<any>;
    /**
     * Verifies the status of a transaction using Solscan API
     * @param signature Transaction signature
     * @returns True if the transaction is successful, false otherwise
     *  */
    verifyTransactionStatus(signature: string): Promise<boolean>;
}
