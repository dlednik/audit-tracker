import "jest-extended";

import { Errors, Managers, Transactions, Utils } from "@arkecosystem/crypto/dist";
import { InvoicePaidBuilder } from "../../../src/builders";
import { InvoicePaidTransaction } from "../../../src/transactions";
import { AuditTrackerType } from "../../../src/enums"

let builder: InvoicePaidBuilder;

describe("InvoicePaid builder",()=>{
    Managers.configManager.setFromPreset("testnet");
    Transactions.TransactionRegistry.registerTransactionType(InvoicePaidTransaction);

    beforeEach(() => {
        builder = new InvoicePaidBuilder();
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
                .invoicePaidData(invoiceAsset)
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
                .invoicePaidData(invoiceAsset)
                .sign("passphrase")
                .secondSign("second passphrase");

            expect(actual.build().verified).toBeTrue();
            expect(actual.verify()).toBeTrue();
        });
    });

    describe("should test properties", () => {
        it("should have its specific properties", () => {
            expect(builder).toHaveProperty("data.type", AuditTrackerType.InvoicePaid);
            expect(builder).toHaveProperty("data.amount", Utils.BigNumber.ZERO);
            expect(builder).toHaveProperty("data.fee", InvoicePaidTransaction.staticFee());
            expect(builder).toHaveProperty("data.recipientId", undefined);
            expect(builder).toHaveProperty("data.senderPublicKey", undefined);
            expect(builder).toHaveProperty("data.version", 2);
            expect(builder).toHaveProperty("data.nonce");
            expect(builder).toHaveProperty("data.asset", { invoicePaid: {} });
        });
    });

    describe("should test invoicePaid asset", () => {
        it("should test attributes", () => {
            const invoiceAsset = {
                hash: "934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B",
                ids: [
                    "2019/0001",
                    "2019/0002"
                ]
            }
            builder.invoicePaidData(invoiceAsset);
            expect(builder.data.asset.invoicePaid.hash).toBe("934A8D3F870699E3F70BEA323CF1DB661EC1D17A2E3456145EAE20CE0F88C96B");
            expect(builder.data.asset.invoicePaid.ids.length).toBe(2);
            expect(builder.data.asset.invoicePaid.ids[0]).toBe("2019/0001");
            expect(builder.data.asset.invoicePaid.ids[1]).toBe("2019/0002");
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
                    .invoicePaidData(invoiceAsset)
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
                .invoicePaidData(invoiceAsset)
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
                .invoicePaidData(invoiceAsset2)
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
