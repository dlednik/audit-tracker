import "jest-extended";

import { Errors, Managers, Transactions, Utils } from "@arkecosystem/crypto/dist";
import { InvoiceAddedBuilder } from "../../../src/builders";
import { InvoiceAddedTransaction } from "../../../src/transactions";
import { AuditTrackerType } from "../../../src/enums"

let builder: InvoiceAddedBuilder;
const amountToSatoshi = value => Utils.BigNumber.make(Math.floor(value * 1e8));

Managers.configManager.setFromPreset("testnet");
Transactions.TransactionRegistry.registerTransactionType(InvoiceAddedTransaction);

describe("InvoiceAdded builder",()=>{
    beforeEach(() => {
        builder = new InvoiceAddedBuilder();
    });

    describe("should test verification", () => {
        it("should verify correctly with single passphrase", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "EUR",
                date: new Date().toISOString(),
                invoice: "2019/0001",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }
            const actual = builder
                .invoiceAddedData(invoiceAsset)
                .sign("passphrase");
            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });

        it("should verify correctly with double passphrase", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "USD",
                date: new Date().toISOString(),
                invoice: "2019/0002",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }
            const actual = builder
                .invoiceAddedData(invoiceAsset)
                .sign("passphrase")
                .secondSign("second passphrase");

            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });
    });

    describe("should test properties", () => {
        it("should have its specific properties", () => {
            expect(builder).toHaveProperty("data.type", AuditTrackerType.InvoiceAdded);
            expect(builder).toHaveProperty("data.amount", Utils.BigNumber.ZERO);
            expect(builder).toHaveProperty("data.fee", InvoiceAddedTransaction.staticFee());
            expect(builder).toHaveProperty("data.recipientId", undefined);
            expect(builder).toHaveProperty("data.senderPublicKey", undefined);
            expect(builder).toHaveProperty("data.version", 2);
            expect(builder).toHaveProperty("data.nonce");
            expect(builder).toHaveProperty("data.asset", { invoiceAdded: {} });
        });
    });

    describe("should test invoiceAdded asset", () => {
        it("should test attributes", () => {
            let date = new Date().toISOString();
            const invoiceAsset = {
                amount: amountToSatoshi(0.0314),
                currency: "BTC",
                date: date,
                invoice: "2019/0003",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }
            builder.invoiceAddedData(invoiceAsset);
            expect(builder.data.asset.invoiceAdded.amount).toStrictEqual(amountToSatoshi(0.0314));
            expect(builder.data.asset.invoiceAdded.currency).toBe("BTC");
            expect(builder.data.asset.invoiceAdded.date).toBe(date);
            expect(builder.data.asset.invoiceAdded.invoice).toBe("2019/0003");
        });
    });

    describe("should test asset", () => {
        it("should reject bad data", () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "2019/0001",
                date: new Date().toISOString(),
                invoice: "2019/0010",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }
            expect(() =>
                builder
                    .invoiceAddedData(invoiceAsset)
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
                invoice: "2019/0001",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }
            const transaction = builder
                .invoiceAddedData(invoiceAsset)
                .sign("passphrase")
                .build();

            const invoiceAsset2 = {
                amount: amountToSatoshi(11.356),
                currency: "RUE",
                date: new Date().toISOString(),
                invoice: "0001/2019",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }
            const transaction2 = builder
                .invoiceAddedData(invoiceAsset2)
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


