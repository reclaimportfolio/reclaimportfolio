const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CACHE_PREFIX = "rp_crypto_chart";
const CACHE_TTL_MS = 75 * 1000;
const inFlightRequests = new Map();

const RANGE_DAYS = {
  "24H": 1,
  "1D": 1,
  "7D": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  YTD: () => Math.max(1, Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000)),
  Max: "max",
};

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
    // Charting works without browser storage; caching is only an API courtesy.
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

async function fetchJson(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" }, referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error("Chart data is temporarily unavailable for this asset.");
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchCoinGeckoChart(coingeckoId, range = "7D", force = false) {
  const id = String(coingeckoId || "").trim();
  if (!id) throw new Error("Chart data is temporarily unavailable for this asset.");
  const cleanRange = RANGE_DAYS[range] ? range : "7D";
  const key = cacheKey("market_chart", { id, range: cleanRange });
  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;
  }

  const configuredDays = RANGE_DAYS[cleanRange];
  const days = typeof configuredDays === "function" ? configuredDays() : configuredDays;
  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`;
  return shareRequest(key, force, async () => {
    const data = await fetchJson(url);
    const prices = Array.isArray(data.prices) ? data.prices : [];
    const volumes = Array.isArray(data.total_volumes) ? data.total_volumes : [];
    const series = prices
      .map(([timestamp, price], index) => ({
        time: new Date(timestamp).toISOString(),
        price: Number(price),
        volume: Number(volumes[index]?.[1] || 0),
      }))
      .filter((point) => Number.isFinite(point.price));

    return writeCache(key, { series, range: cleanRange, updatedAt: new Date().toISOString() });
  });
}

export async function fetchCoinGeckoPrice(coingeckoId, force = false) {
  const id = String(coingeckoId || "").trim();
  if (!id) throw new Error("Chart data is temporarily unavailable for this asset.");
  const key = cacheKey("simple_price", { id });
  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;
  }

  const url = `${COINGECKO_BASE}/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
  return shareRequest(key, force, async () => {
    const data = await fetchJson(url);
    const row = data[id] || {};
    return writeCache(key, {
      price: Number(row.usd),
      change24h: Number(row.usd_24h_change),
      marketCap: Number(row.usd_market_cap),
      volume24h: Number(row.usd_24h_vol),
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function fetchCoinGeckoMarkets(coingeckoIds = [], force = false) {
  const ids = Array.from(new Set(coingeckoIds.map((id) => String(id || "").trim()).filter(Boolean)));
  if (!ids.length) return [];
  const key = cacheKey("markets", { ids });
  if (!force) {
    const cached = readCache(key);
    if (cached) return cached;
  }
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: ids.join(","),
    order: "market_cap_desc",
    per_page: String(ids.length),
    page: "1",
    sparkline: "true",
    price_change_percentage: "24h",
  });
  return shareRequest(key, force, async () => writeCache(
    key,
    await fetchJson(`${COINGECKO_BASE}/coins/markets?${params.toString()}`),
  ));
}
