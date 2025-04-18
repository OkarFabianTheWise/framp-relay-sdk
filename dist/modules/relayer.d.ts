import { PublicKey, VersionedTransaction } from "@solana/web3.js";
export interface RelayerConfig {
    solscanApiKey?: string;
    solscanApiUrl?: string;
    timeout?: number;
}
export interface GiftParams {
    walletPublicKey: PublicKey;
    recipient: string;
    amount: number;
    tokenMint?: string;
}
export interface TransactionResult {
    transaction: VersionedTransaction;
    txBase64: string;
    signature?: string;
}
export declare class FrampRelayer {
    private readonly JUPITER_SWAP_URL;
    private readonly JUPITER_QUOTE_URL;
    private readonly solscanApiUrl;
    private readonly solscanApiKey;
    private readonly timeout;
    constructor(config?: RelayerConfig);
    sendGiftToken({ walletPublicKey, recipient, amount, tokenMint, }: GiftParams): Promise<TransactionResult>;
    verifyTransactionStatus(signature: string): Promise<boolean>;
}
