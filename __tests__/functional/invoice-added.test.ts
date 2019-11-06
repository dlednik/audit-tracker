import "jest-extended";

import { Identities, Managers, Transactions, Utils } from "@arkecosystem/crypto/dist"; 
import { TransactionFactory } from "../helpers/transaction-factory";
import { InvoiceAddedTransaction } from "../../src/transactions"
import * as support from "./__support__";

const { passphrase/*, secondPassphrase*/ } = support.passphrases;

// beforeAll(support.setUp);
// afterAll(support.tearDown);

const amountToSatoshi = value => Utils.BigNumber.make(Math.floor(value * 1e8));

describe("Transaction Forging - InvoiceAdded registration", () => {
    Managers.configManager.setFromPreset("testnet");
    Managers.configManager.getMilestone().aip11 = true;
    Transactions.TransactionRegistry.registerTransactionType(InvoiceAddedTransaction);

    describe("Signed with 1 Passphrase", () => {
        it("should broadcast, accept and forge it [Signed with 1 Passphase]", async () => {
            const invoiceAsset = {
                amount: amountToSatoshi(113.56),
                currency: "EUR",
                date: new Date().toISOString(),
                invoice: "2019/0001",
                customer: "David Lednik, Podvrh 20, 3330 Mozirje, Slovenia"
            }

            const initialFunds = TransactionFactory.transfer(Identities.Address.fromPassphrase(passphrase), 100 * 1e8)
                .withPassphrase("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire")
                .withNonce(Utils.BigNumber.make(4))
                .createOne();

            await expect(initialFunds).toBeAccepted();
            await support.snoozeForBlock(1);
            await expect(initialFunds.id).toBeForged();
    
            // Submit invoceAdded
            const transactions = TransactionFactory.invoiceAdded(invoiceAsset)
                .withPassphrase(passphrase)
                .withNonce(initialFunds.nonce.plus(1))
                .createOne();
    
            await expect(transactions).toBeAccepted();
            await support.snoozeForBlock(1);
            await expect(transactions.id).toBeForged();
        });
    });

    // describe("Signed with 2 Passphrases", () => {
    //     it("should broadcast, accept and forge it [Signed with 2 Passphrases] ", async () => {
    //         // Prepare a fresh wallet for the tests
    //         const passphrase = generateMnemonic();
    //         const secondPassphrase = generateMnemonic();

    //         // Initial Funds
    //         const initialFunds = TransactionFactory.transfer(Identities.Address.fromPassphrase(passphrase), 150 * 1e8)
    //             .withPassphrase(secrets[0])
    //             .createOne();

    //         await expect(initialFunds).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(initialFunds.id).toBeForged();

    //         // Register a second passphrase
    //         const secondSignature = TransactionFactory.secondSignature(secondPassphrase)
    //             .withPassphrase(passphrase)
    //             .createOne();

    //         await expect(secondSignature).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(secondSignature.id).toBeForged();

    //         // Registering a business
    //         const businessRegistration = TransactionFactory.businessRegistration({
    //             name: "arkecosystem",
    //             website: "ark.io",
    //         })
    //             .withPassphrase(passphrase)
    //             .withSecondPassphrase(secondPassphrase)
    //             .createOne();

    //         await expect(businessRegistration).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(businessRegistration.id).toBeForged();

    //         // Registering a bridgechain
    //         const bridgechainRegistration = TransactionFactory.bridgechainRegistration({
    //             name: "cryptoProject",
    //             seedNodes: ["2001:0db8:85a3:0000:0000:8a2e:0370:7334"],
    //             genesisHash: "127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935",
    //             bridgechainRepository: "somerepository",
    //         })
    //             .withPassphrase(passphrase)
    //             .withSecondPassphrase(secondPassphrase)
    //             .createOne();

    //         await expect(bridgechainRegistration).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(bridgechainRegistration.id).toBeForged();
    //     });
    // });

    // describe("Signed with multi signature [3 of 3]", () => {
    //     // Register a multi signature wallet with defaults
    //     const passphrase = generateMnemonic();
    //     const passphrases = [passphrase, secrets[4], secrets[5]];
    //     const participants = [
    //         Identities.PublicKey.fromPassphrase(passphrases[0]),
    //         Identities.PublicKey.fromPassphrase(passphrases[1]),
    //         Identities.PublicKey.fromPassphrase(passphrases[2]),
    //     ];

    //     it("should broadcast, accept and forge it [3-of-3 multisig]", async () => {
    //         // Funds to register a multi signature wallet
    //         const initialFunds = TransactionFactory.transfer(Identities.Address.fromPassphrase(passphrase), 50 * 1e8)
    //             .withPassphrase(secrets[0])
    //             .createOne();

    //         await expect(initialFunds).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(initialFunds.id).toBeForged();

    //         // Registering a multi-signature wallet
    //         const multiSignature = TransactionFactory.multiSignature(participants, 3)
    //             .withPassphrase(passphrase)
    //             .withPassphraseList(passphrases)
    //             .createOne();

    //         await expect(multiSignature).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(multiSignature.id).toBeForged();

    //         // Send funds to multi signature wallet
    //         const multiSigAddress = Identities.Address.fromMultiSignatureAsset(multiSignature.asset.multiSignature);
    //         const multiSigPublicKey = Identities.PublicKey.fromMultiSignatureAsset(multiSignature.asset.multiSignature);

    //         const multiSignatureFunds = TransactionFactory.transfer(multiSigAddress, 100 * 1e8)
    //             .withPassphrase(secrets[0])
    //             .createOne();

    //         await expect(multiSignatureFunds).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(multiSignatureFunds.id).toBeForged();

    //         // Registering a business
    //         const businessRegistration = TransactionFactory.businessRegistration({
    //             name: "ark",
    //             website: "ark.io",
    //         })
    //             .withSenderPublicKey(multiSigPublicKey)
    //             .withPassphraseList(passphrases)
    //             .createOne();

    //         await expect(businessRegistration).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(businessRegistration.id).toBeForged();

    //         // Registering a bridgechain
    //         const bridgechainRegistration = TransactionFactory.bridgechainRegistration({
    //             name: "cryptoProject",
    //             seedNodes: ["2001:0db8:85a3:0000:0000:8a2e:0370:7334"],
    //             genesisHash: "127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935",
    //             bridgechainRepository: "somerepository",
    //         })
    //             .withSenderPublicKey(multiSigPublicKey)
    //             .withPassphraseList(passphrases)
    //             .createOne();

    //         await expect(bridgechainRegistration).toBeAccepted();
    //         await support.snoozeForBlock(1);
    //         await expect(bridgechainRegistration.id).toBeForged();
    //     });
    // });
});
