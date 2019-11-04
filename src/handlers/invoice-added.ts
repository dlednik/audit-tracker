import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions, Utils } from "@arkecosystem/crypto";
import { InvoiceAddedAssetError } from "../errors";
import { AuditTrackerType } from "../enums";
import { AuditTrackerEvents } from "../events";
import { InvoiceAddedTransaction } from "../transactions";

export class InvoiceAddedTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return InvoiceAddedTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return [];
    }

    public async isActivated(): Promise<boolean> {
        return !!Managers.configManager.getMilestone().aip11;
    }

    public dynamicFee(
        transaction: Interfaces.ITransaction,
        addonBytes: number,
        satoshiPerByte: number,
    ): Utils.BigNumber {
        // override dynamicFee calculation as this is a zero-fee transaction
        return Utils.BigNumber.ZERO;
    }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        return;
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
    
        super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
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
        await super.apply(transaction, walletManager);
    }

    public async revertForSender(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
        await super.revert(transaction, walletManager);
    }

    public async applyToRecipient(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
        return;
    }
    
    public async revertForRecipient(transaction: Interfaces.ITransaction, walletManager: State.IWalletManager): Promise<void> {
        return;
    }
}
