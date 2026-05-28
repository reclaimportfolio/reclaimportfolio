import { useCallback, useMemo, useState } from "react";
import {
  createAdminUserAsset,
  deleteAdminAsset,
  getAdminAssets,
  getDashboardAssets,
  updateAdminAsset,
} from "./api.js";
import { CRYPTO_ASSET_SYMBOLS, STOCK_ASSET_SYMBOLS, getStockAssetMeta } from "./lib/assetIconResolver.js";
import { useVisiblePolling } from "./utils/useVisiblePolling.js";

const clean = (value = "") => String(value ?? "").replace(/[<>]/g, "").trim();

export const clientAssetSymbols = CRYPTO_ASSET_SYMBOLS;
export const clientStockSymbols = STOCK_ASSET_SYMBOLS;

function normalizeAsset(asset = {}) {
  const symbol = clean(asset.asset || asset.symbol || "ETH").toUpperCase();
  const assetType = clean(asset.assetType || asset.asset_type || asset.type || (STOCK_ASSET_SYMBOLS.includes(symbol) ? "stock" : "crypto")).toLowerCase() === "stock" ? "stock" : "crypto";
  const stockMeta = assetType === "stock" ? getStockAssetMeta(symbol) : {};
  return {
    ...asset,
    id: String(asset.id || ""),
    clientId: String(asset.clientId || asset.client_id || asset.user || ""),
    clientName: clean(asset.clientName || asset.client_name),
    clientEmail: clean(asset.clientEmail || asset.client_email),
    type: assetType,
    assetType,
    asset: symbol,
    symbol,
    assetName: clean(asset.assetName || asset.asset_name || asset.name || stockMeta.name || asset.asset || "Ethereum"),
    domain: clean(asset.domain || stockMeta.domain),
    chartSymbol: clean(asset.chartSymbol || asset.chart_symbol || stockMeta.chartSymbol),
    amount: clean(asset.amount ?? asset.balance ?? "0"),
    fiatValue: clean(asset.fiatValue ?? asset.fiat_value ?? asset.value ?? "$0.00"),
    currency: clean(asset.currency || "USD").toUpperCase(),
    walletAddress: clean(asset.walletAddress || asset.wallet_address || asset.wallet || asset.depositAddress),
    memoOrTag: clean(asset.memoOrTag || asset.memo_or_tag),
    network: clean(asset.network || (assetType === "stock" ? "US Equities" : "Ethereum")),
    label: clean(asset.label || `${symbol} ${assetType === "stock" ? "position" : "wallet"}`),
    internalNote: clean(asset.internalNote || asset.internal_note),
    visible: asset.visible !== false,
    active: asset.active !== false,
    updatedAt: asset.updatedAt || asset.updated_at || new Date().toISOString(),
    updatedBy: clean(asset.updatedBy || asset.updated_by || "Admin"),
  };
}

function toPayload(asset = {}) {
  const symbol = clean(asset.asset || asset.symbol || "ETH").toUpperCase();
  const assetType = clean(asset.assetType || asset.asset_type || asset.type || (STOCK_ASSET_SYMBOLS.includes(symbol) ? "stock" : "crypto")).toLowerCase() === "stock" ? "stock" : "crypto";
  const stockMeta = assetType === "stock" ? getStockAssetMeta(symbol) : {};
  return {
    asset_type: assetType,
    asset: symbol,
    asset_name: clean(asset.assetName || asset.asset_name || stockMeta.name || asset.asset || "Ethereum"),
    amount: clean(asset.amount ?? "0"),
    fiat_value: clean(asset.fiatValue ?? asset.fiat_value ?? "$0.00"),
    currency: clean(asset.currency || "USD").toUpperCase(),
    wallet_address: assetType === "stock" ? "" : clean(asset.walletAddress || asset.wallet_address),
    memo_or_tag: clean(asset.memoOrTag || asset.memo_or_tag),
    network: clean(asset.network || (assetType === "stock" ? "US Equities" : "")),
    label: clean(asset.label || `${symbol} ${assetType === "stock" ? "position" : "wallet"}`),
    internal_note: clean(asset.internalNote || asset.internal_note),
    visible: asset.visible !== false,
    active: asset.active !== false,
  };
}

export async function upsertClientAsset({ client, asset }) {
  if (!client?.id) throw new Error("Select a client before saving an asset.");
  const payload = toPayload(asset);
  const saved = asset?.id
    ? await updateAdminAsset(asset.id, payload)
    : await createAdminUserAsset(client.id, payload);
  return normalizeAsset(saved);
}

export async function removeClientAsset(id) {
  if (!id) return null;
  return deleteAdminAsset(id);
}

export function useClientAssets({ clientId = "", role = "client", pollMs = 5000 } = {}) {
  const [assets, setAssets] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const rows = role === "admin" ? await getAdminAssets() : await getDashboardAssets();
      setAssets(Array.isArray(rows) ? rows.map(normalizeAsset) : []);
    } catch {
      setAssets([]);
    }
  }, [role]);

  useVisiblePolling(refresh, pollMs);

  return useMemo(() => {
    const visible = role === "admin" ? assets : assets.filter((asset) => asset.clientId === String(clientId) && asset.visible !== false);
    return visible.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [assets, clientId, role]);
}
