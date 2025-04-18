import { PublicKey, VersionedTransaction } from "@solana/web3.js";
export interface GiftParams {
    walletPublicKey: PublicKey;
    recipient: string;
    amount: number;
    tokenMint?: string;
}
export declare function sendGiftToken({ walletPublicKey, recipient, amount, tokenMint, }: GiftParams): Promise<{
    transaction: VersionedTransaction;
    txBase64: string;
}>;
