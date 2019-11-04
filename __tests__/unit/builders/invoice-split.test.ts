import "jest-extended";

import { Errors, Managers, Transactions, Utils } from "@arkecosystem/crypto/dist";
import { InvoiceSplitBuilder } from "../../../src/builders";
import { InvoiceSplitTransaction } from "../../../src/transactions";
import { AuditTrackerType } from "../../../src/enums"

let builder: InvoiceSplitBuilder;
const amountToSatoshi = value => Utils.BigNumber.make(Math.floor(value * 1e8));

describe("InvoiceSplit builder",()=>{
    Managers.configManager.setFromPreset("testnet");
    Transactions.TransactionRegistry.registerTransactionType(InvoiceSplitTransaction);

    beforeEach(() => {
        builder = new InvoiceSplitBuilder();
    });

    describe("should test verification", () => {
        it("should verify correctly with single passphrase", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "EUR",
                date: new Date().toISOString(),
                invoice: "2019/0013",
                parent_invoice: "2019/0003"
            }
            const actual = builder
                .invoiceSplitData(invoiceAsset)
                .sign("passphrase");
            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });

        it("should verify correctly with double passphrase", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "USD",
                date: new Date().toISOString(),
                invoice: "2019/0013",
                parent_invoice: "2019/0003"
            }
            const actual = builder
                .invoiceSplitData(invoiceAsset)
                .sign("passphrase")
                .secondSign("second passphrase");

            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });
    });

    describe("should test properties", () => {
        it("should have its specific properties", () => {
            expect(builder).toHaveProperty("data.type", AuditTrackerType.InvoiceSplit);
            expect(builder).toHaveProperty("data.amount", Utils.BigNumber.ZERO);
            expect(builder).toHaveProperty("data.fee", InvoiceSplitTransaction.staticFee());
            expect(builder).toHaveProperty("data.recipientId", undefined);
            expect(builder).toHaveProperty("data.senderPublicKey", undefined);
            expect(builder).toHaveProperty("data.version", 2);
            expect(builder).toHaveProperty("data.nonce");
            expect(builder).toHaveProperty("data.asset", { invoiceSplit: {} });
        });
    });

    describe("should test invoiceSplit asset", () => {
        it("should test attributes", () => {
            let date = new Date().toISOString();
            const invoiceAsset = {
                amount: amountToSatoshi(0.00314),
                currency: "BTC",
                date: date,
                invoice: "2019/0013",
                parent_invoice: "2019/0003"
            }
            builder.invoiceSplitData(invoiceAsset);
            expect(builder.data.asset.invoiceSplit.amount).toStrictEqual(amountToSatoshi(0.00314));
            expect(builder.data.asset.invoiceSplit.currency).toBe("BTC");
            expect(builder.data.asset.invoiceSplit.date).toBe(date);
            expect(builder.data.asset.invoiceSplit.invoice).toBe("2019/0013");
        });
    });

    describe("should test asset", () => {
        it("should reject bad data", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "2019/0001",
                date: new Date().toISOString(),
                invoice: "2019/0013",
                parent_invoice: "2019/0003"
            }
            expect(() =>
                builder
                    .invoiceSplitData(invoiceAsset)
                    .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquirev")
                    .build(),
            ).toThrowError(Errors.TransactionSchemaError);
        });
    });

    describe("should test deserialization", () => {
        it("should deserialize correctly", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "EUR",
                date: new Date().toISOString(),
                invoice: "2019/0003",
                parent_invoice: "2019/0001"
            }
            const transaction = builder
                .invoiceSplitData(invoiceAsset)
                .sign("passphrase")
                .build();

            const invoiceAsset2 = {
                amount: amountToSatoshi(11.356),
                currency: "RUE",
                date: new Date().toISOString(),
                invoice: "2019/0002",
                parent_invoice: "2019/0001"
            }
            const transaction2 = builder
                .invoiceSplitData(invoiceAsset2)
                .sign("passphrase")
                .build();
            const transactonBuffer = transaction.serialize();
            // Reset offset to 0 as this transaction does not get extra data added from ITransaction
            transactonBuffer.offset = 0;
            transaction2.deserialize(transactonBuffer);
            expect(transaction.data.asset).toEqual(transaction2.data.asset);
        });
    });
});
