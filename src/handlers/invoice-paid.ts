import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions } from "@arkecosystem/crypto";
import { InvoicePaidAssetError } from "../errors";
import { AuditTrackerType } from "../enums";
import { AuditTrackerEvents } from "../events";
import { InvoicePaidTransaction } from "../transactions";

export class InvoicePaidTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return InvoicePaidTransaction;
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
    
        const { hash, ids }: { hash: string; ids: string[] } = data.asset.InvoiceCanceled;
        if (!hash || ids.length == 0) {
            throw new InvoicePaidAssetError();
        }
    
        super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit(AuditTrackerEvents.InvoicePaid, transaction.data);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<boolean> {
        const invoicesHash: string = data.asset.invoicePaid.hash;
    
        const invoicePaidInpool: Interfaces.ITransactionData[] = Array.from(
            await pool.getTransactionsByType(AuditTrackerType.InvoicePaid),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);

        const alreadyHasPendingInvoicePaid: boolean = invoicePaidInpool.some(
            transaction => transaction.asset.invoicePaid.hash === invoicesHash,
        );

        if (alreadyHasPendingInvoicePaid) {
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
