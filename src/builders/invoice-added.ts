import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";
import { InvoiceAddedTransaction } from "../transactions";
import { IInvoiceAddedAsset } from "../interfaces";

export class InvoiceAddedBuilder extends Transactions.TransactionBuilder<InvoiceAddedBuilder> {
    constructor() {
        super();
        this.data.version = 2;
        this.data.typeGroup = InvoiceAddedTransaction.typeGroup;
        this.data.type = InvoiceAddedTransaction.type;
        this.data.fee = InvoiceAddedTransaction.staticFee();
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { invoiceAdded: {} };
    }

    public invoiceAddedData(invoiceAsset: IInvoiceAddedAsset): InvoiceAddedBuilder {
        this.data.asset = {
            invoiceAdded: invoiceAsset
        };

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): InvoiceAddedBuilder {
        return this;
    }
}
