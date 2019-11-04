import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoicePaidAsset } from "../interfaces";
import { InvoicePaidTransaction } from "../transactions";

export class InvoicePaidBuilder extends Transactions.TransactionBuilder<InvoicePaidBuilder> {
    constructor() {
        super();
        this.data.version = 2;
        this.data.typeGroup = InvoiceTransactionGroup;
        this.data.type = AuditTrackerType.InvoicePaid;
        this.data.fee = InvoicePaidTransaction.staticFee();
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { invoicePaid: {} };
    }

    public invoicePaidData(invoiceAsset: IInvoicePaidAsset): InvoicePaidBuilder {
        this.data.asset = {
            invoicePaid: invoiceAsset
        };
        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): InvoicePaidBuilder {
        return this;
    }
}
