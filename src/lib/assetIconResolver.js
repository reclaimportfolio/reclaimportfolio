export const CRYPTO_ASSET_ICON_MAP = {
  BTC: { iconUrl: "https://cdn.simpleicons.org/bitcoin/F7931A", source: "local", coingeckoId: "bitcoin" },
  ETH: { iconUrl: "https://cdn.simpleicons.org/ethereum/627EEA", source: "local", coingeckoId: "ethereum" },
  USDT: { iconUrl: "https://cdn.simpleicons.org/tether/26A17B", source: "local", coingeckoId: "tether" },
  USDC: { iconUrl: "https://cdn.simpleicons.org/usdcoin/2775CA", source: "local", coingeckoId: "usd-coin" },
  BNB: { iconUrl: "https://cdn.simpleicons.org/binance/F3BA2F", source: "local", coingeckoId: "binancecoin" },
  SOL: { iconUrl: "https://cdn.simpleicons.org/solana/14F195", source: "local", coingeckoId: "solana" },
  XRP: { iconUrl: "https://cdn.simpleicons.org/xrp/25A768", source: "local", coingeckoId: "ripple" },
  ADA: { iconUrl: "https://cdn.simpleicons.org/cardano/0033AD", source: "local", coingeckoId: "cardano" },
  DOGE: { iconUrl: "https://cdn.simpleicons.org/dogecoin/C2A633", source: "local", coingeckoId: "dogecoin" },
  AVAX: { iconUrl: "https://cdn.simpleicons.org/avalanche/E84142", source: "local", coingeckoId: "avalanche-2" },
  DOT: { iconUrl: "https://cdn.simpleicons.org/polkadot/E6007A", source: "local", coingeckoId: "polkadot" },
  LINK: { iconUrl: "https://cdn.simpleicons.org/chainlink/375BD2", source: "local", coingeckoId: "chainlink" },
  LTC: { iconUrl: "https://cdn.simpleicons.org/litecoin/A6A9AA", source: "local", coingeckoId: "litecoin" },
  TRX: { iconUrl: "https://cdn.simpleicons.org/tron/EF0027", source: "local", coingeckoId: "tron" },
  MATIC: { iconUrl: "https://cdn.simpleicons.org/polygon/8247E5", source: "local", coingeckoId: "matic-network" },
  POL: { iconUrl: "https://cdn.simpleicons.org/polygon/8247E5", source: "local", coingeckoId: "polygon-ecosystem-token" },
  BCH: { iconUrl: "https://cdn.simpleicons.org/bitcoincash/0AC18E", source: "local", coingeckoId: "bitcoin-cash" },
  UNI: { iconUrl: "https://cdn.simpleicons.org/uniswap/FF007A", source: "local", coingeckoId: "uniswap" },
  ATOM: { iconUrl: "https://cdn.simpleicons.org/cosmos/2E3148", source: "local", coingeckoId: "cosmos" },
  NEAR: { iconUrl: "https://cdn.simpleicons.org/near/00EC97", source: "local", coingeckoId: "near" },
  ARB: { iconUrl: "https://cdn.simpleicons.org/arbitrum/28A0F0", source: "local", coingeckoId: "arbitrum" },
};

export const stockLogoMap = {
  NVDA: {
    type: "stock",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    domain: "nvidia.com",
    logo: "https://logo.clearbit.com/nvidia.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128",
    chartSymbol: "NASDAQ:NVDA",
  },
  NFLX: {
    type: "stock",
    symbol: "NFLX",
    name: "Netflix, Inc.",
    domain: "netflix.com",
    logo: "https://logo.clearbit.com/netflix.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=netflix.com&sz=128",
    chartSymbol: "NASDAQ:NFLX",
  },
  META: {
    type: "stock",
    symbol: "META",
    name: "Meta Platforms, Inc.",
    domain: "meta.com",
    logo: "https://logo.clearbit.com/meta.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=meta.com&sz=128",
    chartSymbol: "NASDAQ:META",
  },
  XOM: {
    type: "stock",
    symbol: "XOM",
    name: "Exxon Mobil Corporation",
    domain: "exxonmobil.com",
    logo: "https://logo.clearbit.com/exxonmobil.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=exxonmobil.com&sz=128",
    chartSymbol: "NYSE:XOM",
  },
  COST: {
    type: "stock",
    symbol: "COST",
    name: "Costco Wholesale Corporation",
    domain: "costco.com",
    logo: "https://logo.clearbit.com/costco.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=costco.com&sz=128",
    chartSymbol: "NASDAQ:COST",
  },
  AAPL: {
    type: "stock",
    symbol: "AAPL",
    name: "Apple Inc.",
    domain: "apple.com",
    logo: "https://logo.clearbit.com/apple.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=apple.com&sz=128",
    chartSymbol: "NASDAQ:AAPL",
  },
  MA: {
    type: "stock",
    symbol: "MA",
    name: "Mastercard Incorporated",
    domain: "mastercard.com",
    logo: "https://logo.clearbit.com/mastercard.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=mastercard.com&sz=128",
    chartSymbol: "NYSE:MA",
  },
  GOOGL: {
    type: "stock",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    domain: "google.com",
    logo: "https://logo.clearbit.com/google.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
    chartSymbol: "NASDAQ:GOOGL",
  },
  BAC: {
    type: "stock",
    symbol: "BAC",
    name: "Bank of America Corporation",
    domain: "bankofamerica.com",
    logo: "https://logo.clearbit.com/bankofamerica.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=bankofamerica.com&sz=128",
    chartSymbol: "NYSE:BAC",
  },
  "BRK.B": {
    type: "stock",
    symbol: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    domain: "berkshirehathaway.com",
    logo: "https://logo.clearbit.com/berkshirehathaway.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=berkshirehathaway.com&sz=128",
    chartSymbol: "NYSE:BRK.B",
  },
  JPM: {
    type: "stock",
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    domain: "jpmorganchase.com",
    logo: "https://logo.clearbit.com/jpmorganchase.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=jpmorganchase.com&sz=128",
    chartSymbol: "NYSE:JPM",
  },
  PG: {
    type: "stock",
    symbol: "PG",
    name: "The Procter & Gamble Company",
    domain: "pg.com",
    logo: "https://logo.clearbit.com/pg.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=pg.com&sz=128",
    chartSymbol: "NYSE:PG",
  },
  KO: {
    type: "stock",
    symbol: "KO",
    name: "The Coca-Cola Company",
    domain: "coca-colacompany.com",
    logo: "https://logo.clearbit.com/coca-colacompany.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=coca-colacompany.com&sz=128",
    chartSymbol: "NYSE:KO",
  },
  AMZN: {
    type: "stock",
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    domain: "amazon.com",
    logo: "https://logo.clearbit.com/amazon.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
    chartSymbol: "NASDAQ:AMZN",
  },
  V: {
    type: "stock",
    symbol: "V",
    name: "Visa Inc.",
    domain: "visa.com",
    logo: "https://logo.clearbit.com/visa.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=visa.com&sz=128",
    chartSymbol: "NYSE:V",
  },
  MSFT: {
    type: "stock",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    domain: "microsoft.com",
    logo: "https://logo.clearbit.com/microsoft.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
    chartSymbol: "NASDAQ:MSFT",
  },
  UNH: {
    type: "stock",
    symbol: "UNH",
    name: "UnitedHealth Group Incorporated",
    domain: "unitedhealthgroup.com",
    logo: "https://logo.clearbit.com/unitedhealthgroup.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=unitedhealthgroup.com&sz=128",
    chartSymbol: "NYSE:UNH",
  },
  AMD: {
    type: "stock",
    symbol: "AMD",
    name: "Advanced Micro Devices, Inc.",
    domain: "amd.com",
    logo: "https://logo.clearbit.com/amd.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=amd.com&sz=128",
    chartSymbol: "NASDAQ:AMD",
  },
  TSLA: {
    type: "stock",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    domain: "tesla.com",
    logo: "https://logo.clearbit.com/tesla.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=tesla.com&sz=128",
    chartSymbol: "NASDAQ:TSLA",
  },
  HD: {
    type: "stock",
    symbol: "HD",
    name: "The Home Depot, Inc.",
    domain: "homedepot.com",
    logo: "https://logo.clearbit.com/homedepot.com",
    fallbackLogo: "https://www.google.com/s2/favicons?domain=homedepot.com&sz=128",
    chartSymbol: "NYSE:HD",
  },
};

export const STOCK_ASSET_LOGO_MAP = stockLogoMap;
export const CRYPTO_ASSET_SYMBOLS = Object.keys(CRYPTO_ASSET_ICON_MAP);
export const STOCK_ASSET_SYMBOLS = Object.keys(STOCK_ASSET_LOGO_MAP);

function cleanSymbol(symbol = "") {
  return String(symbol || "").trim().toUpperCase();
}

function fallbackFor(symbol, name) {
  const clean = cleanSymbol(symbol);
  if (clean) return clean.replace(/[^A-Z0-9]/g, "").slice(0, 4) || clean.slice(0, 2);
  return String(name || "Asset").split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase() || "RP";
}

export function getStockAssetMeta(symbol) {
  const clean = cleanSymbol(symbol);
  const item = STOCK_ASSET_LOGO_MAP[clean] || {};
  const exchange = item.chartSymbol ? item.chartSymbol.split(':')[0] : (item.exchange || "NASDAQ");
  return {
    type: "stock",
    symbol: clean,
    name: item.name || clean,
    domain: item.domain || "",
    logo: item.logo || "",
    fallbackLogo: item.fallbackLogo || "",
    icon: item.logo || "",
    chartSymbol: item.chartSymbol || (clean ? `${exchange}:${clean}` : ""),
  };
}

export function getAssetIcon(asset = {}) {
  const symbol = cleanSymbol(asset.symbol || asset.asset || asset.ticker);
  const assetType = asset.type || asset.assetType;
  const type = assetType || (STOCK_ASSET_LOGO_MAP[symbol] || asset.domain ? "stock" : "crypto");
  const fallback = fallbackFor(symbol, asset.name || asset.companyName);

  if (type === "stock") {
    const mapped = STOCK_ASSET_LOGO_MAP[symbol];
    const domain = mapped?.domain || asset.domain;
    const primaryLogo = mapped?.logo || (domain ? `https://logo.clearbit.com/${domain}` : "");
    const fallbackLogoUrl = mapped?.fallbackLogo || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : "");
    
    return {
      iconUrl: primaryLogo,
      fallbackUrl: fallbackLogoUrl,
      fallback,
      source: mapped?.logo || domain ? "clearbit" : "fallback",
    };
  }

  if (asset.icon && typeof asset.icon === "string") {
    return { iconUrl: asset.icon, fallback, source: "local" };
  }

  if (asset.logoUrl && typeof asset.logoUrl === "string") {
    return { iconUrl: asset.logoUrl, fallback, source: "local" };
  }

  if (asset.liveImage && typeof asset.liveImage === "string") {
    return { iconUrl: asset.liveImage, fallback, source: "coingecko" };
  }

  const mapped = CRYPTO_ASSET_ICON_MAP[symbol];
  if (mapped?.iconUrl) {
    return { iconUrl: mapped.iconUrl, fallback, source: mapped.source || "local" };
  }

  if (asset.coingeckoImage && typeof asset.coingeckoImage === "string") {
    return { iconUrl: asset.coingeckoImage, fallback, source: "coingecko" };
  }

  return { iconUrl: "", fallback, source: "fallback" };
}
