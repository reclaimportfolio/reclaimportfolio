import { apiRequest } from "../lib/apiClient.js";
import { getStockAssetMeta } from "../lib/assetIconResolver.js";

export const DEFAULT_STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "BRK.B",
  "JPM",
  "V",
  "MA",
  "UNH",
  "XOM",
  "COST",
  "HD",
  "PG",
  "NFLX",
  "AMD",
  "BAC",
  "KO",
];

export const STOCK_RANGES = ["1D", "5D", "1M", "6M", "1Y"];

const CACHE_PREFIX = "rp_stock_market";
const CACHE_TTL_MS = 55 * 1000;
const inFlightRequests = new Map();

// Market provider keys belong only in backend/.env; Vite variables are public.
const configuredProvider = "backend";

function cacheKey(name, payload) {
  return `${CACHE_PREFIX}:${name}:${JSON.stringify(payload)}`;
}

function readCache(key) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!cached || Date.now() > cached.expiresAt) return null;
    return cached.value;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, value }));
  } catch {
    // Storage can be disabled in private browser contexts. The dashboard still works without it.
  }
  return value;
}

async function shareRequest(key, force, loader) {
  if (!force && inFlightRequests.has(key)) return inFlightRequests.get(key);
  const request = loader();
  if (!force) inFlightRequests.set(key, request);
  try {
    return await request;
  } finally {
    if (!force) inFlightRequests.delete(key);
  }
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeSeries(series = []) {
  return (Array.isArray(series) ? series : [])
    .map((point, index) => ({
      time: point.time || point.datetime || point.date || `${index}`,
      close: toNumber(point.close ?? point.value ?? point.price, null),
      volume: toNumber(point.volume, 0),
    }))
    .filter((point) => Number.isFinite(point.close));
}

export function normalizeStockData(rawData = {}) {
  const symbol = String(rawData.symbol || "").toUpperCase();
  const meta = getStockAssetMeta(symbol);
  const price = toNumber(rawData.price);
  const change = toNumber(rawData.change);
  const changePercent = toNumber(rawData.changePercent);
  const status = rawData.status || (changePercent > 0.05 ? "up" : changePercent < -0.05 ? "down" : "flat");

  return {
    id: symbol.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    type: "stock",
    symbol,
    name: rawData.companyName || rawData.name || meta.name || symbol || "Unknown company",
    companyName: rawData.companyName || rawData.name || meta.name || symbol || "Unknown company",
    domain: rawData.domain || meta.domain,
    icon: rawData.icon || meta.icon,
    chartSymbol: rawData.chartSymbol || meta.chartSymbol,
    price,
    change,
    changePercent,
    open: toNumber(rawData.open, null),
    high: toNumber(rawData.high, null),
    low: toNumber(rawData.low, null),
    previousClose: toNumber(rawData.previousClose, null),
    volume: toNumber(rawData.volume, null),
    marketCap: toNumber(rawData.marketCap, null),
    exchange: rawData.exchange || "US",
    status,
    chart: normalizeSeries(rawData.chart || rawData.series),
    source: rawData.source || configuredProvider,
    notice: rawData.notice || "",
  };
}

function friendlyStockError(error) {
  const status = Number(error?.status);
  if (status === 429 || status === 503) {
    return new Error("Stock data is unavailable.");
  }
  return new Error(error?.message || "Stock data is unavailable.");
}

export async function fetchStockBatch(symbols = DEFAULT_STOCK_SYMBOLS, { range = "1D", force = false } = {}) {
  const cleanSymbols = (symbols.length ? symbols : DEFAULT_STOCK_SYMBOLS).map((symbol) => String(symbol).trim().toUpperCase()).filter(Boolean);
  const requestKey = cacheKey("batch", { symbols: cleanSymbols, range });
  if (!force) {
    const cached = readCache(requestKey);
    if (cached) return cached;
  }

  const params = new URLSearchParams({
    symbols: cleanSymbols.join(","),
    range,
  });
  if (force) params.set("refresh", "1");

  return shareRequest(requestKey, force, async () => {
    try {
      const payload = await apiRequest(`dashboard/stocks/?${params.toString()}`, { auth: true });
      return writeCache(requestKey, {
        provider: payload?.provider || configuredProvider,
        source: payload?.source || configuredProvider,
        marketStatus: payload?.marketStatus || "",
        updatedAt: payload?.updatedAt || new Date().toISOString(),
        notice: payload?.notice || "",
        errors: payload?.errors || [],
        stocks: (payload?.stocks || []).map(normalizeStockData),
      });
    } catch (error) {
      throw friendlyStockError(error);
    }
  });
}

export async function fetchStockQuote(symbol) {
  const payload = await fetchStockBatch([symbol], { force: true });
  return payload.stocks[0] || null;
}

export async function fetchStockTimeSeries(symbol, range = "1D", { force = false } = {}) {
  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  const cleanRange = STOCK_RANGES.includes(range) ? range : "1D";
  const requestKey = cacheKey("series", { symbol: cleanSymbol, range: cleanRange });
  if (!force) {
    const cached = readCache(requestKey);
    if (cached) return cached;
  }

  const params = new URLSearchParams({ range: cleanRange });
  if (force) params.set("refresh", "1");

  return shareRequest(requestKey, force, async () => {
    try {
      const payload = await apiRequest(`dashboard/stocks/${encodeURIComponent(cleanSymbol)}/series/?${params.toString()}`, { auth: true });
      return writeCache(requestKey, {
        provider: payload?.provider || configuredProvider,
        source: payload?.source || configuredProvider,
        symbol: payload?.symbol || cleanSymbol,
        range: payload?.range || cleanRange,
        updatedAt: payload?.updatedAt || new Date().toISOString(),
        notice: payload?.notice || "",
        series: normalizeSeries(payload?.series || []),
      });
    } catch (error) {
      throw friendlyStockError(error);
    }
  });
}
