import { Utils } from "@arkecosystem/crypto";

export interface IInvoiceAddedAsset {
    amount: Utils.BigNumber;
    currency: string;
    date: string;
    invoice: string;
    customer: string;
}

export interface IInvoiceAddedWalletAttributes {
    [invoice: string]: boolean;
}

export interface IInvoicePaidAsset {
    hash: string;
    ids: string[];
}

export interface IInvoiceCanceledAsset {
    hash: string;
    ids: string[];
}

export interface IInvoiceSplitAsset {
    amount: Utils.BigNumber;
    currency: string;
    date: string;
    invoice: string;
    parent_invoice: string;
}
