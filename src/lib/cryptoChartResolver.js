import {
  COINGECKO_IDS_BY_SYMBOL,
  GECKOTERMINAL_NETWORK_ALIASES,
  STABLECOIN_SYMBOLS,
  TRADINGVIEW_MAJOR_SYMBOLS,
  cleanCryptoSymbol,
} from "./cryptoSymbols.js";

function normalizeChain(chain = "") {
  const key = String(chain || "").trim().toLowerCase();
  return GECKOTERMINAL_NETWORK_ALIASES[key] || key.replace(/\s+/g, "_");
}

export function normalizeCryptoAsset(rawAsset = {}, source = "dashboard") {
  const symbol = cleanCryptoSymbol(rawAsset.symbol || rawAsset.asset || rawAsset.ticker || "");
  const stable = STABLECOIN_SYMBOLS[symbol];
  const coingeckoId = rawAsset.coingeckoId || rawAsset.cgId || stable?.coingeckoId || COINGECKO_IDS_BY_SYMBOL[symbol] || "";

  return {
    type: "crypto",
    symbol,
    name: rawAsset.name || rawAsset.assetName || rawAsset.title || symbol || "Crypto asset",
    chain: normalizeChain(rawAsset.chain || rawAsset.network || rawAsset.blockchain || ""),
    contractAddress: rawAsset.contractAddress || rawAsset.contract || rawAsset.tokenAddress || null,
    pairAddress: rawAsset.pairAddress || rawAsset.poolAddress || rawAsset.dexPair || null,
    coingeckoId,
    logo: rawAsset.logoUrl || rawAsset.liveImage || rawAsset.image || rawAsset.logo || "",
    price: rawAsset.price ?? rawAsset.currentPrice ?? null,
    change24h: rawAsset.change24h ?? rawAsset.priceChange24h ?? rawAsset.price_change_percentage_24h ?? null,
    marketCap: rawAsset.marketCap ?? rawAsset.market_cap ?? null,
    volume24h: rawAsset.volume24h ?? rawAsset.total_volume ?? null,
    chartData: rawAsset.chartData || rawAsset.sparkline || [],
    source,
    raw: rawAsset,
  };
}

export function resolveCryptoChart(rawAsset = {}) {
  const asset = normalizeCryptoAsset(rawAsset);
  const symbol = asset.symbol;
  const stable = STABLECOIN_SYMBOLS[symbol];

  if (asset.pairAddress && asset.chain) {
    return {
      provider: "geckoterminal",
      symbol: `${asset.chain}:${asset.pairAddress}`,
      title: `${asset.name} pool chart`,
      fallbackProvider: asset.coingeckoId ? "coingecko" : "none",
      reason: "DEX pool address and chain are available",
      asset,
    };
  }

  if (asset.contractAddress && asset.chain) {
    return {
      provider: "geckoterminal",
      symbol: `${asset.chain}:${asset.contractAddress}`,
      title: `${asset.name} token chart`,
      fallbackProvider: asset.coingeckoId ? "coingecko" : "none",
      reason: "Token contract and chain are available",
      asset,
    };
  }

  if (stable) {
    return {
      provider: "coingecko",
      symbol: stable.coingeckoId,
      title: stable.title,
      fallbackProvider: "none",
      reason: "Stablecoin price stability is better shown as a simple price display",
      asset: { ...asset, coingeckoId: stable.coingeckoId },
    };
  }

  if (TRADINGVIEW_MAJOR_SYMBOLS[symbol]) {
    return {
      provider: "tradingview",
      symbol: TRADINGVIEW_MAJOR_SYMBOLS[symbol],
      title: `${asset.name} / USDT`,
      fallbackProvider: asset.coingeckoId ? "coingecko" : "none",
      reason: "Major exchange-listed crypto asset",
      asset,
    };
  }

  if (asset.coingeckoId) {
    return {
      provider: "coingecko",
      symbol: asset.coingeckoId,
      title: `${asset.name} price chart`,
      fallbackProvider: "none",
      reason: "CoinGecko asset identifier is available",
      asset,
    };
  }

  return {
    provider: "none",
    symbol: symbol || "",
    title: asset.name || "Unsupported asset",
    fallbackProvider: "none",
    reason: "No supported chart source was found",
    asset,
  };
}
