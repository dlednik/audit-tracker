// tslint:disable:max-classes-per-file
import { Errors } from "@arkecosystem/core-transactions";

export class InvoiceAddedAssetError extends Errors.TransactionError {
    constructor() {
        super(`Failed to apply transaction, because wallet is not a invoiceAdded.`);
    }
}

export class InvoiceAddedAlreadyExistsError extends Errors.TransactionError {
    constructor() {
        super(`Failed to apply transaction, because invoice is already present.`);
    }
}

export class InvoiceCanceledAssetError extends Errors.TransactionError {
    constructor() {
        super(`Failed to apply transaction, because wallet is not a invoiceCanceled.`);
    }
}

export class InvoicePaidAssetError extends Errors.TransactionError {
    constructor() {
        super(`Failed to apply transaction, because wallet is not a invoicePaid.`);
    }
}

export class InvoiceSplitAssetError extends Errors.TransactionError {
    constructor() {
        super(`Failed to apply transaction, because wallet is not a invoicePaid.`);
    }
}
