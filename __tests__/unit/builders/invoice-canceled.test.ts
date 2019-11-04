import "jest-extended";

import { Errors, Managers, Transactions, Utils } from "@arkecosystem/crypto/dist";
import { InvoiceCanceledBuilder } from "../../../src/builders";
import { InvoiceCanceledTransaction } from "../../../src/transactions";
import { AuditTrackerType } from "../../../src/enums"

let builder: InvoiceCanceledBuilder;

describe("InvoiceCanceled builder",()=>{
    Managers.configManager.setFromPreset("testnet");
    Transactions.TransactionRegistry.registerTransactionType(InvoiceCanceledTransaction);

    beforeEach(() => {
        builder = new InvoiceCanceledBuilder();
    });

    describe("should test verification", () => {
        it("should verify correctly with single passphrase", () => {
            const invoiceAsset = {
                hash: "934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B",
                ids: [
                    "2019/0001",
                    "2019/0002"
                ]
            }
            const actual = builder
                .invoiceCanceledData(invoiceAsset)
                .sign("passphrase");
            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });

        it("should verify correctly with double passphrase", () => {
            const invoiceAsset = {
                hash: "934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B",
                ids: [
                    "2019/0001",
                    "2019/0002"
                ]
            }
            const actual = builder
                .invoiceCanceledData(invoiceAsset)
                .sign("passphrase")
                .secondSign("second passphrase");

            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });
    });

    describe("should test properties", () => {
        it("should have its specific properties", () => {
            expect(builder).toHaveProperty("data.type", AuditTrackerType.InvoiceCanceled);
            expect(builder).toHaveProperty("data.amount", Utils.BigNumber.ZERO);
            expect(builder).toHaveProperty("data.fee", InvoiceCanceledTransaction.staticFee());
            expect(builder).toHaveProperty("data.recipientId", undefined);
            expect(builder).toHaveProperty("data.senderPublicKey", undefined);
            expect(builder).toHaveProperty("data.version", 2);
            expect(builder).toHaveProperty("data.nonce");
            expect(builder).toHaveProperty("data.asset", { invoiceCanceled: {} });
        });
    });

    describe("should test invoiceCanceled asset", () => {
        it("should test attributes", () => {
            const invoiceAsset = {
                hash: "934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B",
                ids: [
                    "2019/0001",
                    "2019/0002"
                ]
            }
            builder.invoiceCanceledData(invoiceAsset);
            expect(builder.data.asset.invoiceCanceled.hash).toBe("934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B");
            expect(builder.data.asset.invoiceCanceled.ids.length).toBe(2);
            expect(builder.data.asset.invoiceCanceled.ids[0]).toBe("2019/0001");
            expect(builder.data.asset.invoiceCanceled.ids[1]).toBe("2019/0002");
        });
    });

    describe("should test asset", () => {
        it("should reject bad data", () => {
            const invoiceAsset = {
                hash: "934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B12",
                ids: [
                    "2019/0001",
                    "2019/0002"
                ]
            }
            expect(() =>
                builder
                    .invoiceCanceledData(invoiceAsset)
                    .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquirev")
                    .build(),
            ).toThrowError(Errors.TransactionSchemaError);
        });
    });

    describe("should test deserialization", () => {
        it("should deserialize correctly", () => {
            const invoiceAsset = {
                hash: "934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B",
                ids: [
                    "2019/0001",
                    "2019/0002"
                ]
            }
            const transaction = builder
                .invoiceCanceledData(invoiceAsset)
                .sign("passphrase")
                .build();

            const invoiceAsset2 = {
                hash: "DUMMYD3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B",
                ids: [
                    "2019/0003",
                    "2019/0004"
                ]
            }
            const transaction2 = builder
                .invoiceCanceledData(invoiceAsset2)
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
