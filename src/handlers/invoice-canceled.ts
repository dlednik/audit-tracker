import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions, Utils } from "@arkecosystem/crypto";
import { InvoiceCanceledAssetError } from "../errors";
import { AuditTrackerType } from "../enums";
import { AuditTrackerEvents } from "../events";
import { InvoiceCanceledTransaction } from "../transactions";

export class InvoiceCanceledTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return InvoiceCanceledTransaction;
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
    
        const { hash, ids }: { hash: string; ids: string[] } = data.asset.InvoiceCanceled;
        if (!hash || ids.length == 0) {
            throw new InvoiceCanceledAssetError();
        }
    
        super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit(AuditTrackerEvents.InvoiceCanceled, transaction.data);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<boolean> {
        const invoicesHash: string = data.asset.invoiceCanceled.hash;
    
        const invoiceCanceledInpool: Interfaces.ITransactionData[] = Array.from(
            await pool.getTransactionsByType(AuditTrackerType.InvoiceCanceled),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);

        const alreadyHasPendingInvoiceCancel: boolean = invoiceCanceledInpool.some(
            transaction => transaction.asset.invoiceCanceled.hash === invoicesHash,
        );

        if (alreadyHasPendingInvoiceCancel) {
            processor.pushError(data, "ERR_PENDING", `InvoiceCanceled for "${invoicesHash}" already in the pool`);
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
