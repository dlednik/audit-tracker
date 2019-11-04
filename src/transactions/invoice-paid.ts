import ByteBuffer from "bytebuffer";
import { Transactions, Utils } from "@arkecosystem/crypto";
import { AuditTrackerType, InvoiceTransactionGroup } from "../enums";
import { IInvoicePaidAsset } from "../interfaces";

const { schemas } = Transactions;

export class InvoicePaidTransaction extends Transactions.Transaction {
    public static type: number = AuditTrackerType.InvoicePaid;
    public static typeGroup: number = InvoiceTransactionGroup;
    public static key: string = "invoicePaid";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "invoicePaid",
            required: ["asset"],
            properties: {
                type: { transactionType: AuditTrackerType.InvoicePaid },
                typeGroup: { const: InvoiceTransactionGroup },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["invoicePaid"],
                    additionalProperties: false,
                    properties: {
                        invoicePaid: {
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
        const invoicePaid = data.asset.invoicePaid as IInvoicePaidAsset;
    
        let hashBytes = Buffer.from(invoicePaid.hash, "utf8");
        let invoiceBytesLength = 0;
        let invoiceBytes;
        for (const id of invoicePaid.ids) {
            invoiceBytes = Buffer.from(id, "utf8");
            invoiceBytesLength += 1 + invoiceBytes.length;
        }
    
        const buffer = new ByteBuffer(1 + hashBytes.length + 1 + invoiceBytesLength, true);
    
        buffer.writeUint8(hashBytes.length);
        buffer.append(hashBytes, "hex");

        buffer.writeUint8(invoicePaid.ids.length);
        for (const id of invoicePaid.ids) {
            invoiceBytes = Buffer.from(id, "utf8");
            buffer.writeUint8(invoiceBytes.length);
            buffer.append(invoiceBytes, "hex");
        }
    
        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const invoicePaid = {} as IInvoicePaidAsset;

        const hashLength = buf.readUint8();
        invoicePaid.hash = buf.readString(hashLength);

        invoicePaid.ids = [];
        const invoicesCount = buf.readUint8();
        for (let i=0; i<invoicesCount; i++) {
            const invoiceLength = buf.readUint8();
            invoicePaid.ids.push( buf.readString(invoiceLength) );
        }

        data.asset = {
            invoicePaid
        };
    }
}
