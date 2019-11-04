import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoiceSplitAsset } from "../interfaces";
import { InvoiceSplitTransaction } from "../transactions";

export class InvoiceSplitBuilder extends Transactions.TransactionBuilder<InvoiceSplitBuilder> {
    constructor() {
        super();
        this.data.version = 2;
        this.data.typeGroup = InvoiceTransactionGroup;
        this.data.type = AuditTrackerType.InvoiceSplit;
        this.data.fee = InvoiceSplitTransaction.staticFee();
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { invoiceSplit: {} };
    }

    public invoiceSplitData(invoiceAsset: IInvoiceSplitAsset): InvoiceSplitBuilder {
        this.data.asset = {
            invoiceSplit: invoiceAsset
        };
        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): InvoiceSplitBuilder {
        return this;
    }
}
