import { Container, Logger } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { defaults } from "./defaults";
import { InvoiceAddedTransactionHandler, InvoiceCanceledTransactionHandler, InvoicePaidTransactionHandler, InvoiceSplitTransactionHandler } from "./handlers";

export const plugin: Container.IPluginDescriptor = {
  pkg: require("../package.json"),
  defaults,
  alias: "audit-tracker",
  async register(container: Container.IContainer, options) {
    container.resolvePlugin<Logger.ILogger>("logger").info("Registering custom transaction");
    Handlers.Registry.registerTransactionHandler(InvoiceAddedTransactionHandler);
    Handlers.Registry.registerTransactionHandler(InvoiceCanceledTransactionHandler);
    Handlers.Registry.registerTransactionHandler(InvoicePaidTransactionHandler);
    Handlers.Registry.registerTransactionHandler(InvoiceSplitTransactionHandler);
  },
  async deregister(container: Container.IContainer, options) {
    container.resolvePlugin<Logger.ILogger>("logger").info("Deregistering custom transaction");
    return container.resolvePlugin("audit-tracker").exit();
  }
};
