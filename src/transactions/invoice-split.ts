import ByteBuffer from "bytebuffer";
import Long from "long";
import { Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoiceSplitAsset } from "../interfaces";

const { schemas } = Transactions;

export class InvoiceSplitTransaction extends Transactions.Transaction {
    public static type: number = AuditTrackerType.InvoiceSplit;
    public static typeGroup: number = InvoiceTransactionGroup;
    public static key: string = "invoiceSplit";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "invoiceSplit",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: AuditTrackerType.InvoiceSplit },
                typeGroup: { const: InvoiceTransactionGroup },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["invoiceSplit"],
                    additionalProperties: false,
                    properties: {
                        invoiceSplit: {
                            type: "object",
                            required: ["amount", "date", "invoice", "parent_invoice"],
                            additionalProperties: false,
                            properties: {
                                amount: { bignumber: { minimum: 1 } },
                                currency: {
                                    type: "string",
                                    minLength: 2,
                                    maxLength: 5,
                                },
                                date: {
                                    type: "string",
                                    format: "date-time",
                                    minLength: 24,
                                    maxLength: 27,
                                },
                                invoice: {
                                    type: "string",
                                    minLength: 4,
                                    maxLength: 20,
                                },
                                parent_invoice: {
                                    type: "string",
                                    minLength: 4,
                                    maxLength: 20,
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make("5000000000");

    public serialize(): ByteBuffer {
        const { data } = this;
        const invoiceSplit = data.asset.invoiceSplit as IInvoiceSplitAsset;
    
        const currencyBytes = Buffer.from(invoiceSplit.currency, "utf8");
        const dateBytes = Buffer.from(invoiceSplit.date, "utf8");
        const invoiceBytes = Buffer.from(invoiceSplit.invoice, "utf8");
        const parentInvoiceBytes = Buffer.from(invoiceSplit.parent_invoice, "utf8");
    
        const buffer = new ByteBuffer(8 + currencyBytes.length + dateBytes.length + invoiceBytes.length + parentInvoiceBytes.length + 4, true);
    
        buffer.writeUint64(Long.fromString(invoiceSplit.amount.toString()));

        buffer.writeUint8(currencyBytes.length);
        buffer.append(currencyBytes, "hex");

        buffer.writeUint8(dateBytes.length);
        buffer.append(dateBytes, "hex");

        buffer.writeUint8(invoiceBytes.length);
        buffer.append(invoiceBytes, "hex");

        buffer.writeUint8(parentInvoiceBytes.length);
        buffer.append(parentInvoiceBytes, "hex");
    
        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const invoiceSplit = {} as IInvoiceSplitAsset;
    
        invoiceSplit.amount = Utils.BigNumber.make(buf.readUint64().toString());

        const currencyLength = buf.readUint8();
        invoiceSplit.currency = buf.readString(currencyLength);

        const dateLength = buf.readUint8();
        invoiceSplit.date = buf.readString(dateLength);

        const invoiceLength = buf.readUint8();
        invoiceSplit.invoice = buf.readString(invoiceLength);

        const parentInvoiceLength = buf.readUint8();
        invoiceSplit.parent_invoice = buf.readString(parentInvoiceLength);

        data.asset = {
            invoiceSplit
        };
    }
}
