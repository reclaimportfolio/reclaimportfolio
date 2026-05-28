import { useCallback, useMemo, useState } from "react";
import {
  createAdminUserTransaction,
  deleteAdminTransaction,
  getAdminTransactions,
  getDashboardTransactions,
  updateAdminTransaction,
} from "./api.js";
import { CRYPTO_ASSET_SYMBOLS, STOCK_ASSET_SYMBOLS } from "./lib/assetIconResolver.js";
import { useVisiblePolling } from "./utils/useVisiblePolling.js";

const clean = (value = "") => String(value ?? "").replace(/[<>]/g, "").trim();

export const transactionTypes = ["deposit", "withdrawal", "swap", "stock_buy", "stock_sell", "transfer", "recovery_credit", "fee"];
export const transactionStatuses = ["pending", "processing", "completed", "failed", "cancelled"];
export const transactionAssets = [...CRYPTO_ASSET_SYMBOLS, ...STOCK_ASSET_SYMBOLS];

export const transactionTypeLabels = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  swap: "Swap",
  stock_buy: "Stock Buy",
  stock_sell: "Stock Sell",
  transfer: "Transfer",
  recovery_credit: "Recovery Credit",
  fee: "Fee",
};

export const transactionStatusLabels = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function normalizeTransactionStatus(status = "pending") {
  const value = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  return transactionStatuses.includes(value) ? value : "pending";
}

export function normalizeTransactionType(type = "deposit") {
  const value = String(type).trim().toLowerCase().replace(/\s+/g, "_");
  return transactionTypes.includes(value) ? value : "deposit";
}

export function formatSignedAmount(amount, asset, direction = "credit") {
  const raw = clean(amount);
  const value = raw.startsWith("+") || raw.startsWith("-") ? raw.slice(1) : raw || "0";
  return `${direction === "debit" ? "-" : "+"}${value} ${asset}`;
}

function makeTransactionId() {
  return `TX-${Math.floor(9000 + Math.random() * 900)}`;
}

function normalizeTransaction(tx = {}) {
  const type = normalizeTransactionType(tx.type);
  const status = normalizeTransactionStatus(tx.status);
  const asset = clean(tx.asset || "ETH").toUpperCase();
  const direction = tx.direction === "debit" ? "debit" : "credit";
  return {
    ...tx,
    id: String(tx.id || ""),
    clientId: String(tx.clientId || tx.client_id || tx.user || ""),
    clientName: clean(tx.clientName || tx.client_name),
    clientEmail: clean(tx.clientEmail || tx.client_email),
    transactionId: clean(tx.transactionId || tx.transaction_id) || makeTransactionId(),
    type,
    typeLabel: tx.typeLabel || transactionTypeLabels[type],
    asset,
    amount: clean(tx.amount || "0"),
    direction,
    displayAmount: tx.displayAmount || formatSignedAmount(tx.amount || "0", asset, direction),
    fiatValue: clean(tx.fiatValue || tx.fiat_value || "$0.00"),
    status,
    statusLabel: tx.statusLabel || transactionStatusLabels[status],
    network: clean(tx.network),
    txHash: clean(tx.txHash || tx.tx_hash),
    clientNote: clean(tx.clientNote || tx.client_note),
    internalNote: clean(tx.internalNote || tx.internal_note),
    transactionDate: tx.transactionDate || tx.transaction_date || new Date().toISOString(),
    createdAt: tx.createdAt || tx.created_at || new Date().toISOString(),
    updatedAt: tx.updatedAt || tx.updated_at || tx.created_at || new Date().toISOString(),
    createdBy: tx.createdBy || tx.created_by || "Admin",
  };
}

function toPayload(data = {}) {
  return {
    transaction_id: clean(data.transactionId || data.transaction_id) || makeTransactionId(),
    type: normalizeTransactionType(data.type),
    asset: clean(data.asset || "ETH").toUpperCase(),
    amount: clean(data.amount || "0"),
    direction: data.direction === "debit" ? "debit" : "credit",
    fiat_value: clean(data.fiatValue || data.fiat_value || "$0.00"),
    status: normalizeTransactionStatus(data.status),
    network: clean(data.network),
    tx_hash: clean(data.txHash || data.tx_hash),
    client_note: clean(data.clientNote || data.client_note),
    internal_note: clean(data.internalNote || data.internal_note),
    transaction_date: data.transactionDate || data.transaction_date || new Date().toISOString(),
  };
}

export async function createClientTransaction({ client, data }) {
  if (!client?.id) throw new Error("Select a client before creating a transaction.");
  const created = await createAdminUserTransaction(client.id, toPayload(data));
  return normalizeTransaction(created);
}

export async function updateClientTransaction({ id, data }) {
  if (!id) throw new Error("Select a transaction before saving.");
  const updated = await updateAdminTransaction(id, toPayload(data));
  return normalizeTransaction(updated);
}

export async function deleteClientTransaction(id) {
  if (!id) return null;
  return deleteAdminTransaction(id);
}

export function useClientTransactions({ clientId = "", role = "client", pollMs = 5000 } = {}) {
  const [transactions, setTransactions] = useState([]);
  const refresh = useCallback(async () => {
    try {
      const rows = role === "admin" ? await getAdminTransactions() : await getDashboardTransactions();
      setTransactions(Array.isArray(rows) ? rows.map(normalizeTransaction) : []);
    } catch {
      setTransactions([]);
    }
  }, [role]);

  useVisiblePolling(refresh, pollMs);

  return useMemo(() => {
    const visible = role === "admin" ? transactions : transactions.filter((tx) => tx.clientId === String(clientId));
    return visible.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  }, [clientId, role, transactions]);
}
