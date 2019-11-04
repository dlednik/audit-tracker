import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoiceCanceledAsset } from "../interfaces";
import { InvoiceCanceledTransaction } from "../transactions";

export class InvoiceCanceledBuilder extends Transactions.TransactionBuilder<InvoiceCanceledBuilder> {
    constructor() {
        super();
        this.data.version = 2;
        this.data.typeGroup = InvoiceTransactionGroup;
        this.data.type = AuditTrackerType.InvoiceCanceled;
        this.data.fee = InvoiceCanceledTransaction.staticFee();
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { invoiceCanceled: {} };
    }

    public invoiceCanceledData(invoiceAsset: IInvoiceCanceledAsset): InvoiceCanceledBuilder {
        this.data.asset = {
            invoiceCanceled: invoiceAsset
        };
        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): InvoiceCanceledBuilder {
        return this;
    }
}
