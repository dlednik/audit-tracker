import ByteBuffer from "bytebuffer";
import Long from "long";
import { Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoiceAddedAsset } from "../interfaces";

const { schemas } = Transactions;

export class InvoiceAddedTransaction extends Transactions.Transaction {
    public static type: number = AuditTrackerType.InvoiceAdded;
    public static typeGroup: number = InvoiceTransactionGroup;
    public static key: string = "invoiceAdded";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "invoiceAdded",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: AuditTrackerType.InvoiceAdded },
                typeGroup: { const: InvoiceTransactionGroup },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["invoiceAdded"],
                    additionalProperties: false,
                    properties: {
                        invoiceAdded: {
                            type: "object",
                            required: ["amount", "currency", "date", "invoice", "customer"],
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
                                customer: {
                                    type: "string",
                                    maxLength: 255,
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
        const invoiceAdded = data.asset.invoiceAdded as IInvoiceAddedAsset;

        const invoiceBytes = Buffer.from(invoiceAdded.invoice, "utf8");
        const currencyBytes = Buffer.from(invoiceAdded.currency, "utf8");
        const dateBytes = Buffer.from(invoiceAdded.date, "utf8");
        const customerBytes = Buffer.from(invoiceAdded.customer, "utf8");
    
        const buffer: ByteBuffer = new ByteBuffer(8 + currencyBytes.length + dateBytes.length + invoiceBytes.length + customerBytes.length + 4, true);

        buffer.writeUint64(Long.fromString(invoiceAdded.amount.toString()));

        buffer.writeUint8(currencyBytes.length);
        buffer.append(currencyBytes, "hex");

        buffer.writeUint8(dateBytes.length);
        buffer.append(dateBytes, "hex");

        buffer.writeUint8(invoiceBytes.length);
        buffer.append(invoiceBytes, "hex");

        buffer.writeUint8(customerBytes.length);
        buffer.append(customerBytes, "hex");
    
        // console.log(buffer);
        // buffer.offset = 0;
        // console.log(buffer);
        // buffer.clear();
        // console.log(buffer);
        return buffer;
    }

    public deserialize(buffer: ByteBuffer): void {
        const { data } = this;
        const invoiceAdded = {} as IInvoiceAddedAsset;

        invoiceAdded.amount = Utils.BigNumber.make(buffer.readUint64().toString());

        const currencyLength = buffer.readUint8();
        invoiceAdded.currency = buffer.readString(currencyLength);

        const dateLength = buffer.readUint8();
        invoiceAdded.date = buffer.readString(dateLength);

        const invoiceLength = buffer.readUint8();
        invoiceAdded.invoice = buffer.readString(invoiceLength);

        const customerLength = buffer.readUint8();
        invoiceAdded.customer = buffer.readString(customerLength);
    
        data.asset = {
            invoiceAdded
        };
    }
}
