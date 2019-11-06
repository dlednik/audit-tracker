import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions, Utils } from "@arkecosystem/crypto";
import { InvoiceSplitAssetError } from "../errors";
import { AuditTrackerType } from "../enums";
import { AuditTrackerEvents } from "../events";
import { InvoiceSplitTransaction } from "../transactions";

export class InvoiceSplitTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return InvoiceSplitTransaction;
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

    // public dynamicFee(
    //     transaction: Interfaces.ITransaction,
    //     addonBytes: number,
    //     satoshiPerByte: number,
    // ): Utils.BigNumber {
    //     // override dynamicFee calculation as this is a zero-fee transaction
    //     return Utils.BigNumber.ZERO;
    // }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        return;
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        databaseWalletManager: State.IWalletManager,
    ): Promise<void> {
        const { data }: Interfaces.ITransaction = transaction;
    
        const { amount, currency, date, invoice, parent_invoice }: { amount: Utils.BigNumber, currency: string, date: string, invoice: string, parent_invoice: string } = data.asset.InvoiceSplit;
        if (!amount || !currency || !date || !invoice || !parent_invoice) {
            throw new InvoiceSplitAssetError();
        }
    
        super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit(AuditTrackerEvents.InvoiceSplit, transaction.data);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<boolean> {
        const invoiceId: string = data.asset.invoiceSplit.invoice;

        const invoiceSplitInpool: Interfaces.ITransactionData[] = Array.from(
            await pool.getTransactionsByType(AuditTrackerType.InvoiceSplit),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);

        const alreadyHasPendingInvoiceSplit: boolean = invoiceSplitInpool.some(
            transaction => transaction.asset.invoiceSplit.invoice === invoiceId,
        );

        if (alreadyHasPendingInvoiceSplit) {
            processor.pushError(data, "ERR_PENDING", `InvoiceSplit for "${invoiceId}" already in the pool`);
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
