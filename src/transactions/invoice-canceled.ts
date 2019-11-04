import ByteBuffer from "bytebuffer";
import { Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoiceCanceledAsset } from "../interfaces";

const { schemas } = Transactions;

export class InvoiceCanceledTransaction extends Transactions.Transaction {
    public static type: number = AuditTrackerType.InvoiceCanceled;
    public static typeGroup: number = InvoiceTransactionGroup;
    public static key: string = "invoiceCanceled";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "invoiceCanceled",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: AuditTrackerType.InvoiceCanceled },
                typeGroup: { const: InvoiceTransactionGroup },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["invoiceCanceled"],
                    additionalProperties: false,
                    properties: {
                        invoiceCanceled: {
                            type: "object",
                            required: ["hash", "ids"],
                            additionalProperties: false,
                            properties: {
                                hash: {
                                    type: "string",
                                    minLength: 64,
                                    maxLength: 64
                                },
                                ids: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    minItems: 1,
                                    maxItems: 255,
                                    uniqueItems: true
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
        const invoiceCanceled = data.asset.invoiceCanceled as IInvoiceCanceledAsset;
    
        let hashBytes = Buffer.from(invoiceCanceled.hash, "utf8");
        let invoiceBytesLength = 0;
        let invoiceBytes;
        for (const id of invoiceCanceled.ids) {
            invoiceBytes = Buffer.from(id, "utf8");
            invoiceBytesLength += 1 + invoiceBytes.length;
        }
    
        const buffer = new ByteBuffer(1 + hashBytes.length + 1 + invoiceBytesLength, true);
    
        buffer.writeUint8(hashBytes.length);
        buffer.append(hashBytes, "hex");

        buffer.writeUint8(invoiceCanceled.ids.length);
        for (const id of invoiceCanceled.ids) {
            invoiceBytes = Buffer.from(id, "utf8");
            buffer.writeUint8(invoiceBytes.length);
            buffer.append(invoiceBytes, "hex");
        }
    
        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const invoiceCanceled = {} as IInvoiceCanceledAsset;
    
        const hashLength = buf.readUint8();
        invoiceCanceled.hash = buf.readString(hashLength);

        invoiceCanceled.ids = [];
        const invoicesCount = buf.readUint8();
        for (let i=0; i<invoicesCount; i++) {
            const invoiceLength = buf.readUint8();
            invoiceCanceled.ids.push( buf.readString(invoiceLength) );
        }

        data.asset = {
            invoiceCanceled
        };
    }
}
