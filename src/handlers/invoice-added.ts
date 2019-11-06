import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions, Utils } from "@arkecosystem/crypto";
import { InvoiceAddedAssetError, InvoiceAddedAlreadyExistsError } from "../errors";
import { AuditTrackerType } from "../enums";
import { AuditTrackerEvents } from "../events";
import { IInvoiceAddedWalletAttributes, IInvoiceAddedAsset } from "../interfaces";
import { InvoiceAddedTransaction } from "../transactions";
import { TransactionReader } from "@arkecosystem/core-transactions"

export class InvoiceAddedTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return InvoiceAddedTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["invoiceAdded", "invoiceAdded.invoices"];
    }

    public async isActivated(): Promise<boolean> {
        return Managers.configManager.getMilestone().aip11 === true;
    }

    // public dynamicFee(
    //     transaction: Interfaces.ITransaction,
    //     addonBytes: number,
    //     satoshiPerByte: number,
    // ): Utils.BigNumber {
    //     // override dynamicFee calculation as this is a zero-fee transaction
    //     return Utils.BigNumber.ZERO;
    // }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        const reader: TransactionReader = await TransactionReader.create(connection, this.getConstructor());

        while (reader.hasNext()) {
            const transactions = await reader.read();

            for (const transaction of transactions) {
                const wallet = walletManager.findByPublicKey(transaction.senderPublicKey);
                if (!wallet.hasAttribute("invoiceAdded")) {
                    wallet.setAttribute("invoiceAdded", { invoices: {} });
                }

                const invoicesAdded: IInvoiceAddedWalletAttributes = wallet.getAttribute("invoiceAdded.invoices");
                invoicesAdded[transaction.asset.invoicesAdded.invoice] = true;
            }
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        databaseWalletManager: State.IWalletManager,
    ): Promise<void> {
        const { data }: Interfaces.ITransaction = transaction;
    
        const { amount, currency, date, invoice, customer }: { amount: Utils.BigNumber, currency: string, date: string, invoice: string, customer: string } = data.asset.invoiceAdded;
        if (!amount || !currency || !date || !invoice || !customer) {
            throw new InvoiceAddedAssetError();
        }

        if (wallet.hasAttribute("invoiceAdded") && wallet.getAttribute("invoiceAdded.invoices")[invoice]) {
            throw new InvoiceAddedAlreadyExistsError();
        }
    
        return super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit(AuditTrackerEvents.InvoiceAdded, transaction.data);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<boolean> {
        const invoiceId: string = data.asset.invoiceAdded.invoice;

        const invoiceAddedInpool: Interfaces.ITransactionData[] = Array.from(
            await pool.getTransactionsByType(AuditTrackerType.InvoiceAdded),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);

        const alreadyHasPendingInvoiceAdd: boolean = invoiceAddedInpool.some(
            transaction => transaction.asset.invoiceAdded.invoice === invoiceId,
        );

        if (alreadyHasPendingInvoiceAdd) {
            processor.pushError(data, "ERR_PENDING", `InvoiceAdded for "${invoiceId}" already in the pool`);
            return false;
        }

        return true;
    }

    public async applyToSender(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
        await super.applyToSender(transaction, walletManager);

        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        if (!sender.hasAttribute("invoiceAdded")) {
            sender.setAttribute("invoiceAdded", { invoices: {} });
        }

        const invoicesAdded: IInvoiceAddedAsset = sender.getAttribute("invoiceAdded.invoices");
        invoicesAdded[transaction.data.asset.invoiceAdded.invoice] = true;

        walletManager.reindex(sender);
    }

    public async revertForSender(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
        await super.revertForSender(transaction, walletManager);

        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        const invoicesAdded: IInvoiceAddedWalletAttributes = sender.getAttribute("invoiceAdded.invoices");
        delete invoicesAdded[transaction.data.asset.invoiceAdded.invoice];

        walletManager.reindex(sender);
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
        // tslint:disable-next-line: no-empty
    ): Promise<void> {}

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
        // tslint:disable-next-line: no-empty
    ): Promise<void> {}
}
