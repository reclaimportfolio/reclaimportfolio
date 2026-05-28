import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LuBell,
  LuChartLine,
  LuChevronRight,
  LuCircleAlert,
  LuCopy,
  LuDownload,
  LuFileCheck2,
  LuFileText,
  LuFilter,
  LuKeyRound,
  LuLockKeyhole,
  LuMenu,
  LuPlus,
  LuReceiptText,
  LuRefreshCw,
  LuRepeat2,
  LuSearch,
  LuSend,
  LuSettings,
  LuShield,
  LuShieldCheck,
  LuUpload,
  LuUserRound,
  LuWallet,
  LuX,
} from "react-icons/lu";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  SiBinance,
  SiBitcoin,
  SiCardano,
  SiCircle,
  SiDogecoin,
  SiEthereum,
  SiPolygon,
  SiSolana,
  SiTether,
  SiXrp,
} from "react-icons/si";
import { GiTronArrow } from "react-icons/gi";
import { useApp } from "../context.js";
import { AssetIcon } from "../components/dashboard/AssetIcon.jsx";
import { CryptoChartDisplay } from "../components/dashboard/crypto/CryptoChartDisplay.jsx";
import { useSession } from "../auth/SessionProvider.jsx";
import {
  createDashboardDepositReview,
  createDashboardStockBuyRequest,
  createDashboardStockSellRequest,
  createDashboardSwapRequest,
  createDashboardWithdrawalRequest,
  getDashboardOverview,
} from "../api.js";
import { getErrorMessage } from "../utils/errorMessages.js";
import { useClientAssets } from "../clientAssets.js";
import { createCaseReport, reportCategories, useCaseReports } from "../caseReports.js";
import { useClientTransactions } from "../clientTransactions.js";
import { createDocumentUpload, getKycState, useDocumentUploads } from "../documentUploads.js";
import { DEFAULT_STOCK_SYMBOLS, STOCK_RANGES, fetchStockBatch, fetchStockTimeSeries } from "../services/stockService.js";
import { fetchCoinGeckoChart, fetchCoinGeckoMarkets } from "../services/cryptoChartService.js";
import { getStockAssetMeta } from "../lib/assetIconResolver.js";
import {
  createTicket as createSupportTicket,
  markTicketRead,
  priorityLabels,
  sendTicketMessage,
  statusLabels,
  ticketPriorities,
  useTicketStore,
} from "../supportTickets.js";
import { Badge } from "../ui.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { UserMenu } from "./UserMenu.jsx";

const formatCurrency = (value, compact = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : value > 1000 ? 0 : 2,
    notation: compact ? "compact" : "standard",
  }).format(value);

const displayCurrencies = [
  { code: "USD", label: "USD", rate: 1 },
  { code: "EUR", label: "EUR", rate: 0.92 },
  { code: "GBP", label: "GBP", rate: 0.79 },
  { code: "JPY", label: "JPY", rate: 156.8 },
  { code: "CNY", label: "CNY", rate: 7.24 },
  { code: "CAD", label: "CAD", rate: 1.36 },
  { code: "AUD", label: "AUD", rate: 1.51 },
];

const formatDisplayCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);

const formatCompactNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(number);
};

const formatNullableCurrency = (value, compact = false) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return formatCurrency(number, compact);
};

const formatPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0.00%";
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
};

const formatMarketTime = (value) => {
  if (!value) return "Not updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
};

const formatTicketTime = (value) =>
  value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "";

const cryptoAssets = [
  {
    cgId: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    logo: SiBitcoin,
    color: "#F7931A",
    price: 103842.18,
    change24h: 1.84,
    marketCap: 2047000000000,
    volume24h: 38100000000,
    balance: 0.28452,
    value: 29541.58,
    network: "Bitcoin",
    confirmations: "3 confirmations",
    depositAddress: "bc1q9rp8x0k4assignedbackendvault5h9v2q",
    chartData: [42, 45, 44, 49, 51, 48, 54, 57, 56, 61, 63, 66],
  },
  {
    cgId: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    logo: SiEthereum,
    color: "#627EEA",
    price: 3826.41,
    change24h: -0.62,
    marketCap: 459900000000,
    volume24h: 20400000000,
    balance: 7.18,
    value: 27472.61,
    network: "Ethereum ERC-20",
    confirmations: "12 confirmations",
    depositAddress: "0x7f31D6BackendAssignedVault9c4A812b5e",
    chartData: [54, 58, 56, 55, 53, 57, 59, 58, 62, 61, 60, 64],
  },
  {
    cgId: "tether",
    symbol: "USDT",
    name: "Tether",
    logo: SiTether,
    color: "#26A17B",
    price: 1,
    change24h: 0.02,
    marketCap: 112400000000,
    volume24h: 60400000000,
    balance: 18420,
    value: 18420,
    network: "Ethereum ERC-20",
    confirmations: "12 confirmations",
    depositAddress: "0x39b8BackendAssignedUSDTDeposit6a14B",
    chartData: [50, 50, 51, 50, 50, 49, 50, 50, 51, 50, 50, 50],
  },
  {
    cgId: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    logo: SiCircle,
    color: "#2775CA",
    price: 1,
    change24h: -0.01,
    marketCap: 33600000000,
    volume24h: 8700000000,
    balance: 12650,
    value: 12650,
    network: "Ethereum ERC-20",
    confirmations: "12 confirmations",
    depositAddress: "0x68c0BackendAssignedUSDCDepositF04e",
    chartData: [49, 50, 50, 50, 50, 51, 50, 50, 50, 50, 49, 50],
  },
  {
    cgId: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    logo: SiBinance,
    color: "#F3BA2F",
    price: 612.76,
    change24h: 2.17,
    marketCap: 90400000000,
    volume24h: 2100000000,
    balance: 18.42,
    value: 11290.04,
    network: "BNB Smart Chain BEP-20",
    confirmations: "15 confirmations",
    depositAddress: "0x9BnbBackendAssignedVaultBEP20a74",
    chartData: [38, 41, 43, 42, 46, 48, 47, 50, 54, 53, 56, 59],
  },
  {
    cgId: "solana",
    symbol: "SOL",
    name: "Solana",
    logo: SiSolana,
    color: "#14F195",
    price: 178.3,
    change24h: 4.18,
    marketCap: 82700000000,
    volume24h: 5400000000,
    balance: 49.8,
    value: 8879.34,
    network: "Solana",
    confirmations: "Finalized",
    depositAddress: "9cVSBackendAssignedSolanaVaultQp71n2",
    chartData: [36, 39, 43, 41, 46, 51, 49, 55, 58, 60, 63, 68],
  },
  {
    cgId: "ripple",
    symbol: "XRP",
    name: "XRP",
    logo: SiXrp,
    color: "#23292F",
    price: 0.61,
    change24h: -1.24,
    marketCap: 33700000000,
    volume24h: 1800000000,
    balance: 8500,
    value: 5185,
    network: "XRP Ledger",
    confirmations: "Validated ledger",
    depositAddress: "rBackendAssignedXrpVault8PhgM9",
    chartData: [62, 60, 59, 61, 58, 57, 55, 56, 54, 53, 55, 52],
  },
  {
    cgId: "cardano",
    symbol: "ADA",
    name: "Cardano",
    logo: SiCardano,
    color: "#0033AD",
    price: 0.72,
    change24h: 0.88,
    marketCap: 25500000000,
    volume24h: 690000000,
    balance: 4200,
    value: 3024,
    network: "Cardano",
    confirmations: "15 confirmations",
    depositAddress: "addr1qxBackendAssignedCardanoVault2rny",
    chartData: [44, 45, 43, 46, 48, 47, 49, 51, 50, 52, 54, 55],
  },
  {
    cgId: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    logo: SiDogecoin,
    color: "#C2A633",
    price: 0.16,
    change24h: -2.31,
    marketCap: 23400000000,
    volume24h: 1200000000,
    balance: 10500,
    value: 1680,
    network: "Dogecoin",
    confirmations: "20 confirmations",
    depositAddress: "DBackendAssignedDogeVault7n42P",
    chartData: [58, 56, 55, 52, 54, 51, 49, 48, 50, 47, 46, 44],
  },
  {
    cgId: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    color: "#E84142",
    price: 36.82,
    change24h: 1.92,
    marketCap: 14700000000,
    volume24h: 530000000,
    balance: 86.4,
    value: 3180.45,
    network: "Avalanche C-Chain",
    confirmations: "Finalized",
    depositAddress: "0xAvaxBackendAssignedVaultCChain42",
    chartData: [40, 41, 43, 42, 45, 47, 46, 49, 51, 52, 54, 56],
  },
  {
    cgId: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    color: "#E6007A",
    price: 7.12,
    change24h: -0.84,
    marketCap: 10100000000,
    volume24h: 270000000,
    balance: 520,
    value: 3702.4,
    network: "Polkadot",
    confirmations: "Finalized",
    depositAddress: "1DotBackendAssignedVault9wK2",
    chartData: [50, 49, 51, 48, 47, 49, 46, 45, 47, 46, 45, 44],
  },
  {
    cgId: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    color: "#375BD2",
    price: 18.44,
    change24h: 0.76,
    marketCap: 10800000000,
    volume24h: 420000000,
    balance: 210,
    value: 3872.4,
    network: "Ethereum ERC-20",
    confirmations: "12 confirmations",
    depositAddress: "0xLinkBackendAssignedVaultB7c2",
    chartData: [42, 43, 44, 43, 45, 46, 45, 48, 49, 48, 50, 51],
  },
  {
    cgId: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    color: "#A6A9AA",
    price: 86.21,
    change24h: -0.31,
    marketCap: 6500000000,
    volume24h: 360000000,
    balance: 24.8,
    value: 2138.01,
    network: "Litecoin",
    confirmations: "20 confirmations",
    depositAddress: "ltc1qBackendAssignedLitecoinVault8x2",
    chartData: [53, 52, 51, 50, 51, 49, 48, 50, 49, 48, 47, 48],
  },
  {
    cgId: "polygon-ecosystem-token",
    symbol: "POL",
    name: "Polygon",
    logo: SiPolygon,
    color: "#8247E5",
    price: 0.69,
    change24h: 1.36,
    marketCap: 6400000000,
    volume24h: 390000000,
    balance: 6200,
    value: 4278,
    network: "Polygon PoS",
    confirmations: "128 blocks",
    depositAddress: "0xPolBackendAssignedPolygonVaultb31A",
    chartData: [40, 42, 41, 44, 45, 47, 46, 49, 52, 51, 53, 55],
  },
  {
    cgId: "tron",
    symbol: "TRX",
    name: "TRON",
    logo: GiTronArrow,
    color: "#EF0027",
    price: 0.11,
    change24h: 0.58,
    marketCap: 9800000000,
    volume24h: 410000000,
    balance: 9200,
    value: 1012,
    network: "TRON TRC20",
    confirmations: "19 confirmations",
    depositAddress: "TTronBackendAssignedVault8k21",
    chartData: [37, 38, 38, 39, 40, 39, 41, 41, 42, 43, 43, 44],
  },
  {
    cgId: "bitcoin-cash",
    symbol: "BCH",
    name: "Bitcoin Cash",
    color: "#0AC18E",
    price: 452.9,
    change24h: 1.08,
    marketCap: 8900000000,
    volume24h: 310000000,
    balance: 7.4,
    value: 3351.46,
    network: "Bitcoin Cash",
    confirmations: "15 confirmations",
    depositAddress: "qBackendAssignedBchVault9f2n",
    chartData: [46, 47, 48, 47, 49, 50, 49, 51, 53, 52, 54, 55],
  },
  {
    cgId: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    color: "#FF007A",
    price: 10.14,
    change24h: -1.18,
    marketCap: 6100000000,
    volume24h: 190000000,
    balance: 340,
    value: 3447.6,
    network: "Ethereum ERC-20",
    confirmations: "12 confirmations",
    depositAddress: "0xUniBackendAssignedVault2a91",
    chartData: [55, 54, 52, 53, 51, 50, 48, 49, 47, 46, 47, 45],
  },
  {
    cgId: "cosmos",
    symbol: "ATOM",
    name: "Cosmos",
    color: "#2E3148",
    price: 8.73,
    change24h: 0.44,
    marketCap: 3400000000,
    volume24h: 130000000,
    balance: 460,
    value: 4015.8,
    network: "Cosmos Hub",
    confirmations: "Finalized",
    depositAddress: "cosmos1BackendAssignedVault6p9",
    chartData: [41, 41, 42, 43, 42, 44, 45, 44, 46, 47, 46, 48],
  },
  {
    cgId: "near",
    symbol: "NEAR",
    name: "NEAR Protocol",
    color: "#00EC97",
    price: 6.18,
    change24h: 2.26,
    marketCap: 6800000000,
    volume24h: 280000000,
    balance: 640,
    value: 3955.2,
    network: "NEAR",
    confirmations: "Finalized",
    depositAddress: "nearbackendassignedvault.near",
    chartData: [36, 38, 40, 39, 42, 44, 43, 46, 48, 50, 52, 55],
  },
  {
    cgId: "arbitrum",
    symbol: "ARB",
    name: "Arbitrum",
    color: "#28A0F0",
    price: 1.16,
    change24h: -0.66,
    marketCap: 4500000000,
    volume24h: 220000000,
    balance: 2800,
    value: 3248,
    network: "Arbitrum One",
    confirmations: "Finalized",
    depositAddress: "0xArbBackendAssignedVault7A1",
    chartData: [49, 48, 50, 47, 46, 48, 45, 44, 46, 45, 44, 43],
  },
].map((asset) => ({
  ...asset,
  id: asset.cgId,
  type: "crypto",
  coingeckoId: asset.cgId,
  chartSymbol: `BINANCE:${asset.symbol === "POL" ? "POL" : asset.symbol}USDT`,
}));

function networkForDashboardAsset(symbol, fallback = "") {
  return fallback || cryptoAssets.find((asset) => asset.symbol === symbol)?.network || "";
}

function mergeCoinGeckoMarketData(baseAssets, marketRows) {
  if (!Array.isArray(marketRows) || marketRows.length === 0) return baseAssets;
  return baseAssets.map((asset) => {
    const live = marketRows.find((row) => row.id === asset.cgId);
    if (!live) return asset;
    const price = live.current_price ?? asset.price;
    const balance = asset.balance;
    const sparkline = live.sparkline_in_7d?.price?.filter((value) => Number.isFinite(value));

    return {
      ...asset,
      price,
      change24h: live.price_change_percentage_24h ?? asset.change24h,
      marketCap: live.market_cap ?? asset.marketCap,
      volume24h: live.total_volume ?? asset.volume24h,
      value: balance * price,
      chartData: sparkline?.length ? sparkline.slice(-48) : asset.chartData,
      liveImage: live.image,
      lastUpdated: live.last_updated,
      dataSource: "CoinGecko",
      isLive: true,
    };
  });
}

function useLiveCryptoMarkets() {
  const [assets, setAssets] = useState(cryptoAssets);
  const [status, setStatus] = useState({ loading: false, error: "", updatedAt: "" });

  useEffect(() => {
    let alive = true;

    async function loadMarkets() {
      try {
        setStatus((current) => ({ ...current, loading: true, error: "" }));
        const rows = await fetchCoinGeckoMarkets(cryptoAssets.map((asset) => asset.cgId));
        if (!alive) return;
        setAssets(mergeCoinGeckoMarketData(cryptoAssets, rows));
        setStatus({ loading: false, error: "", updatedAt: new Date().toISOString() });
      } catch (error) {
        if (!alive) return;
        setAssets(cryptoAssets);
        setStatus({
          loading: false,
          error: "Live market feed unavailable. Showing secure fallback data.",
          updatedAt: "",
        });
      }
    }

    loadMarkets();
    const interval = window.setInterval(() => {
      if (!document.hidden) loadMarkets();
    }, 60000);
    const resume = () => {
      if (!document.hidden) loadMarkets();
    };
    document.addEventListener("visibilitychange", resume);

    return () => {
      alive = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  return { assets, ...status };
}

function IconTile({ children, tone = "neutral" }) {
  return <span className={`dash-icon-tile ${tone}`}>{children}</span>;
}

function AssetLogo({ asset, size = "md" }) {
  const pixelSize = size === "lg" ? 52 : size === "sm" ? 24 : 36;
  return <AssetIcon asset={{ type: "crypto", ...asset }} size={pixelSize} className={`asset-logo ${size}`} />;
}

function MiniLineChart({ data, positive = true, label = "trend" }) {
  const width = 220;
  const height = 72;
  const safeData = Array.isArray(data) ? data.map(Number).filter(Number.isFinite) : [];
  const series = safeData.length > 1 ? safeData : [0, 0];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 12) - 6;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className={`line-chart ${positive ? "positive" : "negative"}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <polyline points={points} />
    </svg>
  );
}

function MarketSnapshotPanel({ asset }) {
  const change24h = Number(asset?.change24h) || 0;
  const price = Number(asset?.price) || 0;
  const volume = Number(asset?.volume24h) || 0;
  const marketCap = Number(asset?.marketCap) || 0;
  const positive = change24h >= 0;

  return (
    <div className="market-snapshot-panel">
      <div>
        <span>Market price</span>
        <strong>{formatCurrency(price)}</strong>
        <em className={positive ? "is-up" : "is-down"}>{positive ? "+" : ""}{change24h.toFixed(2)}% 24h</em>
      </div>
      <MiniLineChart data={asset?.chartData} positive={positive} label={`${asset?.symbol || "Asset"} market trend`} />
      <div className="market-snapshot-meta">
        <span>Market cap <strong>{formatCurrency(marketCap, true)}</strong></span>
        <span>Volume <strong>{formatCurrency(volume, true)}</strong></span>
      </div>
    </div>
  );
}

function PriceChartPanel({ asset, compact = false }) {
  const [range, setRange] = useState("24H");
  const source = asset.chartData?.length ? asset.chartData : [asset.price];
  const fallbackBase = source[source.length - 1] || 1;
  const series = asset.isLive ? source : source.map((value) => asset.price * (value / fallbackBase));
  const width = 920;
  const height = compact ? 300 : 420;
  const chartTop = 34;
  const chartBottom = compact ? 226 : 326;
  const chartLeft = 22;
  const chartRight = 846;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const pad = (max - min || max * 0.02 || 1) * 0.18;
  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;
  const yRange = yMax - yMin || 1;
  const positive = series[series.length - 1] >= series[0];
  const color = positive ? "#1F9D7A" : "#FF4B45";

  const xFor = (index) => chartLeft + (index / Math.max(series.length - 1, 1)) * (chartRight - chartLeft);
  const yFor = (value) => chartBottom - ((value - yMin) / yRange) * (chartBottom - chartTop);
  const points = series.map((value, index) => [xFor(index), yFor(value)]);
  const linePath = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${chartRight} ${chartBottom} L${chartLeft} ${chartBottom} Z`;
  const axisValues = Array.from({ length: 6 }, (_, index) => yMax - (index / 5) * yRange);
  const rangeOptions = ["24H", "7D", "1M", "3M", "YTD", "1Y", "Max"];
  const volumeBars = series.map((value, index) => {
    const previous = series[index - 1] ?? value;
    const move = Math.abs(value - previous);
    return 10 + Math.min(42, (move / yRange) * 220 + (index % 5) * 2);
  });
  const lastPoint = points[points.length - 1] || [chartRight, chartBottom];

  return (
    <div className={`price-chart-panel ${compact ? "compact" : ""}`}>
      <div className="price-chart-toolbar">
        <div className="chart-left-tools">
          <button>Price <span>⌄</span></button>
          <button>Compare <span>⌄</span></button>
          <button className="chart-tool-icon" aria-label="Line chart">⌁</button>
          <button className="chart-tool-icon inverse" aria-label="Trading view">TV</button>
        </div>
        <div className="chart-range-tools">
          {rangeOptions.map((option) => (
            <button key={option} className={range === option ? "active" : ""} onClick={() => setRange(option)}>
              {option}
            </button>
          ))}
          <button className="chart-tool-icon" aria-label="Calendar">□</button>
          <button className="chart-tool-icon" aria-label="Share">↗</button>
          <button className="chart-tool-icon" aria-label="More">⋮</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="price-chart-svg" role="img" aria-label={`${asset.name} live price chart`}>
        <defs>
          <pattern id={`dot-grid-${asset.symbol}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={color} opacity="0.09" />
          </pattern>
        </defs>
        {axisValues.map((value) => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line x1={chartLeft} x2={chartRight + 2} y1={y} y2={y} className="price-grid-line" />
              <text x={chartRight + 10} y={y + 4} className="price-axis-label">{formatCurrency(value, value >= 1000000)}</text>
            </g>
          );
        })}
        <path d={`M${chartLeft} ${chartTop} H${chartRight} V${chartBottom} H${chartLeft} Z`} fill={`url(#dot-grid-${asset.symbol})`} />
        <path d={areaPath} fill={color} opacity="0.1" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPoint[0]} cy={lastPoint[1]} r="5.5" fill={color} stroke="var(--bg-1)" strokeWidth="3" />
        <rect x={lastPoint[0] + 9} y={lastPoint[1] - 13} width="76" height="26" rx="6" fill={color} />
        <text x={lastPoint[0] + 17} y={lastPoint[1] + 4} className="price-last-label">{formatCurrency(series[series.length - 1])}</text>
        <g className="chart-event-pins">
          {[0.44, 0.6, 0.7].map((position, index) => (
            <g key={position} transform={`translate(${chartLeft + (chartRight - chartLeft) * position} ${chartBottom + 31})`}>
              <rect x="-9" y="-9" width="18" height="18" rx="5" />
              <text x="-4.8" y="5">{index + 1}</text>
            </g>
          ))}
        </g>
        <g className="volume-bars">
          {volumeBars.map((bar, index) => {
            const x = chartLeft + (index / Math.max(volumeBars.length - 1, 1)) * (chartRight - chartLeft);
            return <rect key={`${bar}-${index}`} x={x} y={chartBottom + 66 - bar} width="2.2" height={bar} rx="1" />;
          })}
        </g>
        {["13:00", "16:00", "19:00", "22:00", "18. May", "04:00", "07:00", "10:00"].map((label, index) => (
          <text key={label} x={chartLeft + index * ((chartRight - chartLeft) / 7)} y={chartBottom + 86} className="price-time-label">
            {label}
          </text>
        ))}
        {!compact && (
          <g className="range-strip">
            <rect x={chartLeft} y={height - 56} width={chartRight - chartLeft} height="44" rx="2" />
            <path d={`M${chartLeft} ${height - 16} C${chartLeft + 160} ${height - 52}, ${chartLeft + 270} ${height - 8}, ${chartLeft + 420} ${height - 36} S${chartLeft + 690} ${height - 4}, ${chartRight} ${height - 38} L${chartRight} ${height - 12} H${chartLeft} Z`} />
            {["2014", "2016", "2018", "2020", "2022", "2024", "2026"].map((label, index) => (
              <text key={label} x={chartLeft + 46 + index * 128} y={height - 16}>{label}</text>
            ))}
          </g>
        )}
      </svg>
      <div className="price-chart-meta">
        <span>Price movement</span>
        <strong className={positive ? "is-up" : "is-down"}>{positive ? "+" : ""}{asset.change24h.toFixed(2)}% 24h</strong>
      </div>
    </div>
  );
}

const chartRanges = {
  "24H": { days: 1, labels: 8 },
  "7D": { days: 7, labels: 7 },
  "1M": { days: 30, labels: 6 },
  "3M": { days: 90, labels: 6 },
  YTD: { days: Math.max(1, Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000)), labels: 6 },
  "1Y": { days: 365, labels: 7 },
  Max: { days: "max", labels: 7 },
};

function fallbackChartPoints(asset) {
  const now = Date.now();
  const price = Number(asset?.price) || 0;
  const volume = Number(asset?.volume24h) || 0;
  const chartData = Array.isArray(asset?.chartData) ? asset.chartData.map(Number).filter(Number.isFinite) : [];
  const data = chartData.length > 1 ? chartData : [price, price];
  const base = data[data.length - 1] || 1;
  return data.map((value, index) => ({
    time: now - (data.length - 1 - index) * 3600000,
    price: asset?.isLive ? value : price * (value / base),
    volume: volume / Math.max(data.length, 1),
  }));
}

function formatChartTime(timestamp, range) {
  const date = new Date(timestamp);
  if (range === "24H") return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
  if (range === "7D" || range === "1M" || range === "3M") return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  return new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date);
}

function RealTimePriceChart({ asset, compact = false }) {
  if (!asset) return null;
  const [range, setRange] = useState("24H");
  const [chartPoints, setChartPoints] = useState(() => fallbackChartPoints(asset));
  const [chartStatus, setChartStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    let alive = true;

    async function loadChart() {
      if (!asset.cgId) {
        setChartPoints(fallbackChartPoints(asset));
        return;
      }

      try {
        setChartStatus({ loading: true, error: "" });
        const payload = await fetchCoinGeckoChart(asset.cgId, range);
        const nextPoints = (payload.series || [])
          .map((point) => ({ time: new Date(point.time).getTime(), price: point.price, volume: point.volume }))
          .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.price));

        if (!alive) return;
        if (nextPoints.length < 2) throw new Error("Chart feed returned no usable prices");
        setChartPoints(nextPoints);
        setChartStatus({ loading: false, error: "" });
      } catch (error) {
        if (!alive) return;
        setChartPoints(fallbackChartPoints(asset));
        setChartStatus({ loading: false, error: "Live chart unavailable. Showing fallback series." });
      }
    }

    loadChart();
    const interval = window.setInterval(() => {
      if (!document.hidden) loadChart();
    }, range === "24H" ? 75000 : 120000);
    const resume = () => {
      if (!document.hidden) loadChart();
    };
    document.addEventListener("visibilitychange", resume);

    return () => {
      alive = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [asset, range]);

  const width = 920;
  const height = compact ? 300 : 420;
  const chartTop = 34;
  const chartBottom = compact ? 226 : 326;
  const chartLeft = 22;
  const chartRight = 846;
  const prices = chartPoints.map((point) => point.price);
  const volumes = chartPoints.map((point) => point.volume);
  const timeMin = Math.min(...chartPoints.map((point) => point.time));
  const timeMax = Math.max(...chartPoints.map((point) => point.time));
  const timeRange = timeMax - timeMin || 1;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min || max * 0.02 || 1) * 0.18;
  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;
  const yRange = yMax - yMin || 1;
  const positive = prices[prices.length - 1] >= prices[0];
  const color = positive ? "#1F9D7A" : "#FF4B45";
  const chartChange = ((prices[prices.length - 1] - prices[0]) / (prices[0] || 1)) * 100;
  const maxVolume = Math.max(...volumes, 1);
  const chartId = `${asset.symbol}-${range}-${compact ? "compact" : "detail"}`;
  const xFor = (timestamp) => chartLeft + ((timestamp - timeMin) / timeRange) * (chartRight - chartLeft);
  const yFor = (value) => chartBottom - ((value - yMin) / yRange) * (chartBottom - chartTop);
  const points = chartPoints.map((point) => [xFor(point.time), yFor(point.price)]);
  const linePath = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${chartRight} ${chartBottom} L${chartLeft} ${chartBottom} Z`;
  const axisValues = Array.from({ length: 6 }, (_, index) => yMax - (index / 5) * yRange);
  const rangeOptions = ["24H", "7D", "1M", "3M", "YTD", "1Y", "Max"];
  const volumeBars = volumes.map((value) => 6 + Math.min(46, (value / maxVolume) * 46));
  const lastPoint = points[points.length - 1] || [chartRight, chartBottom];
  const timeLabels = Array.from({ length: chartRanges[range]?.labels || 6 }, (_, index, arr) => {
    const time = timeMin + (index / Math.max(arr.length - 1, 1)) * timeRange;
    return { label: formatChartTime(time, range), x: xFor(time) };
  });
  const stripTop = height - 56;
  const stripBottom = height - 12;
  const stripYFor = (value) => stripBottom - ((value - min) / (max - min || 1)) * (stripBottom - stripTop - 8) - 4;
  const stripPath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"}${xFor(point.time).toFixed(2)} ${stripYFor(point.price).toFixed(2)}`).join(" ");
  const markerX = Math.min(lastPoint[0] + 9, chartRight - 84);

  return (
    <div className={`price-chart-panel ${compact ? "compact" : ""}`}>
      <div className="price-chart-toolbar">
        <div className="chart-left-tools">
          <button>Price <span>v</span></button>
          <button>Compare <span>v</span></button>
          <button className="chart-tool-icon" aria-label="Line chart">~</button>
          <button className="chart-tool-icon inverse" aria-label="Trading view">TV</button>
        </div>
        <div className="chart-range-tools">
          {rangeOptions.map((option) => (
            <button key={option} className={range === option ? "active" : ""} onClick={() => setRange(option)}>
              {option}
            </button>
          ))}
          <button className="chart-tool-icon" aria-label="Calendar">Cal</button>
          <button className="chart-tool-icon" aria-label="Share">Link</button>
          <button className="chart-tool-icon" aria-label="More">...</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="price-chart-svg" role="img" aria-label={`${asset.name} live price chart`}>
        <defs>
          <pattern id={`dot-grid-${chartId}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={color} opacity="0.09" />
          </pattern>
        </defs>
        {axisValues.map((value) => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line x1={chartLeft} x2={chartRight + 2} y1={y} y2={y} className="price-grid-line" />
              <text x={chartRight + 10} y={y + 4} className="price-axis-label">{formatCurrency(value, value >= 1000000)}</text>
            </g>
          );
        })}
        <path d={`M${chartLeft} ${chartTop} H${chartRight} V${chartBottom} H${chartLeft} Z`} fill={`url(#dot-grid-${chartId})`} />
        <path d={areaPath} fill={color} opacity="0.1" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPoint[0]} cy={lastPoint[1]} r="5.5" fill={color} stroke="var(--bg-1)" strokeWidth="3" />
        <rect x={markerX} y={lastPoint[1] - 13} width="92" height="26" rx="6" fill={color} />
        <text x={markerX + 8} y={lastPoint[1] + 4} className="price-last-label">{formatCurrency(prices[prices.length - 1])}</text>
        <g className="volume-bars">
          {volumeBars.map((bar, index) => {
            const x = xFor(chartPoints[index]?.time ?? timeMin);
            const barWidth = Math.max(1.2, Math.min(3, (chartRight - chartLeft) / Math.max(volumeBars.length, 1) - 1));
            return <rect key={`${bar}-${index}`} x={x} y={chartBottom + 66 - bar} width={barWidth} height={bar} rx="1" />;
          })}
        </g>
        {timeLabels.map(({ label, x }, index) => (
          <text key={`${label}-${index}`} x={x} y={chartBottom + 86} className="price-time-label">
            {label}
          </text>
        ))}
        {!compact && (
          <g className="range-strip">
            <rect x={chartLeft} y={height - 56} width={chartRight - chartLeft} height="44" rx="2" />
            <path d={`${stripPath} L${chartRight} ${height - 12} H${chartLeft} Z`} />
            {timeLabels.map(({ label, x }, index) => (
              <text key={`${label}-strip-${index}`} x={x} y={height - 16}>{label}</text>
            ))}
          </g>
        )}
      </svg>
      <div className="price-chart-meta">
        <span>{chartStatus.loading ? "Updating chart..." : chartStatus.error || `${range} price and volume`}</span>
        <strong className={positive ? "is-up" : "is-down"}>{positive ? "+" : ""}{chartChange.toFixed(2)}% {range}</strong>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon = LuCircleAlert, title, copy }) {
  return (
    <div className="portal-empty">
      <Icon />
      <strong>{title}</strong>
      <span>{copy}</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, copy, action }) {
  return (
    <div className="portal-section-head">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <div className="portal-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button className="portal-modal-backdrop" onClick={onClose} aria-label="Close modal" />
      <div className="portal-modal-card">
        <div className="portal-modal-head">
          <h3>{title}</h3>
          <button className="portal-icon-button" onClick={onClose} aria-label="Close">
            <LuX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AssetDetailModal({ asset, onClose, onDeposit, onWithdraw }) {
  if (!asset) return null;
  const change24h = Number(asset.change24h) || 0;
  const price = Number(asset.price) || 0;
  const value = Number(asset.value) || 0;
  const balance = Number(asset.balance) || 0;
  const positive = change24h >= 0;

  return (
    <ModalShell title={`${asset.name || asset.symbol || "Asset"} asset detail`} onClose={onClose}>
      <div className="asset-detail-grid">
        <div className="asset-detail-main">
          <div className="asset-detail-title">
            <AssetLogo asset={asset} size="lg" />
            <div>
              <span>{asset.symbol || "Asset"}</span>
              <h4>{asset.name || asset.assetName || asset.symbol || "Assigned asset"}</h4>
            </div>
          </div>
          <div className="detail-chart-panel">
            <div>
              <span>Market price</span>
              <strong>{formatCurrency(price)}</strong>
              <em className={positive ? "is-up" : "is-down"}>{positive ? "+" : ""}{change24h}% 24h</em>
              {asset.lastUpdated && <small>Updated {new Date(asset.lastUpdated).toLocaleTimeString()}</small>}
            </div>
          </div>
          <CryptoChartDisplay asset={asset} height={360} />
          <div className="transaction-list">
            {[
              ["Current balance", asset.symbol || "", `${formatNumber(balance)} ${asset.symbol || ""}`, "Open"],
              ["Portfolio value", "", formatCurrency(value), "Final"],
              ["Admin address assignment", asset.symbol || "", "Backend", "Reviewing"],
            ].map(([label, sym, amount, status]) => (
              <div key={label}>
                <span><LuReceiptText /> {label}</span>
                <strong>{amount} {sym}</strong>
                <Badge s={status} />
              </div>
            ))}
          </div>
        </div>
        <aside className="asset-detail-side">
          <div className="kv"><span className="k">Balance</span><span className="v">{formatNumber(balance)} {asset.symbol || ""}</span></div>
          <div className="kv"><span className="k">Value</span><span className="v">{formatCurrency(value)}</span></div>
          <div className="kv"><span className="k">Network</span><span className="v">{asset.network || "Not assigned"}</span></div>
          <div className="kv"><span className="k">Confirmations</span><span className="v">{asset.confirmations || "Backend assigned"}</span></div>
          <div className="detail-actions">
            <button className="portal-primary" onClick={() => onDeposit(asset)}><LuWallet /> Deposit</button>
            <button className="portal-secondary" onClick={() => onWithdraw(asset)}><LuSend /> Withdraw / Send</button>
          </div>
          <div className="security-note">
            <LuShieldCheck />
            Wallet addresses shown here are backend-assigned by Reclaim Portfolio administrators.
          </div>
        </aside>
      </div>
    </ModalShell>
  );
}

function WalletTransferAssetPicker({ mode, assets = [], onClose, onChoose }) {
  if (!mode) return null;
  const isDeposit = mode === "deposit";
  const selectableAssets = isDeposit
    ? assets
    : assets.filter((asset) => Number(asset.balance || 0) > 0);

  return (
    <ModalShell title={isDeposit ? "Select deposit asset" : "Select withdrawal asset"} onClose={onClose}>
      <div className="wallet-transfer-picker">
        <span className="wallet-transfer-picker-label">{isDeposit ? "Assigned crypto wallets" : "Available crypto balances"}</span>
        <div className="wallet-transfer-assets">
          {selectableAssets.map((asset) => (
            <button
              key={asset.id || asset.symbol}
              className="wallet-transfer-asset"
              onClick={() => onChoose(asset)}
              aria-label={`${isDeposit ? "Deposit" : "Withdraw"} ${asset.name}`}
            >
              <AssetLogo asset={asset} />
              <div className="wallet-transfer-identity">
                <strong>{asset.name}</strong>
                <span>{asset.symbol} - {asset.network}</span>
              </div>
              <div className="wallet-transfer-value">
                <strong>{isDeposit ? asset.symbol : `${formatNumber(asset.balance)} ${asset.symbol}`}</strong>
                <span>{isDeposit ? "Select" : formatCurrency(asset.value)}</span>
              </div>
              <LuChevronRight className="wallet-transfer-chevron" />
            </button>
          ))}
          {!selectableAssets.length && (
            <EmptyState
              title={isDeposit ? "No deposit assets assigned" : "No balance available to withdraw"}
              copy={isDeposit ? "Assigned crypto wallets will appear here." : "A funded crypto asset is required for withdrawal."}
            />
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function DepositModal({ asset, onClose }) {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ amount: "", txHash: "", network: networkForDashboardAsset(asset?.symbol, asset?.network) });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reviewTx, setReviewTx] = useState(null);
  const amount = Number(form.amount);
  const invalidAmount = form.amount && (Number.isNaN(amount) || amount <= 0);
  const txHashLooksValid = form.txHash.trim().length >= 8;
  const canSubmit = amount > 0 && txHashLooksValid && form.network && !submitting;

  useEffect(() => {
    if (!asset) return;
    setForm({ amount: "", txHash: "", network: networkForDashboardAsset(asset.symbol, asset.network) });
    setSubmitError("");
    setReviewTx(null);
    setSubmitting(false);
  }, [asset?.id, asset?.symbol, asset?.network]);

  if (!asset) return null;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(asset.depositAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const submitDepositReview = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const created = await createDashboardDepositReview({
        asset: asset.symbol,
        amount: form.amount,
        network: form.network,
        tx_hash: form.txHash,
      });
      setReviewTx(created);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to submit deposit proof."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title={`Deposit ${asset.symbol}`} onClose={onClose}>
      {reviewTx ? (
        <div className="review-step">
          <IconTile tone="accent"><LuShieldCheck /></IconTile>
          <h4>Deposit pending review</h4>
          <p className="muted">Your transaction hash has been submitted. Admin will verify the blockchain payment before manually crediting or approving the deposit.</p>
          <div className="kv"><span className="k">Request ID</span><span className="v mono">{reviewTx.transactionId || reviewTx.transaction_id}</span></div>
          <div className="kv"><span className="k">Status</span><span className="v"><Badge s={reviewTx.statusLabel || "Pending"} /></span></div>
          <div className="kv"><span className="k">Amount</span><span className="v">{form.amount} {asset.symbol}</span></div>
          <div className="kv"><span className="k">Transaction hash</span><span className="v mono">{form.txHash}</span></div>
          <div className="modal-actions">
            <button className="portal-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      ) : (
      <div className="deposit-card">
        <div className="deposit-asset">
          <AssetLogo asset={asset} size="lg" />
          <div>
            <span>Selected asset and network</span>
            <strong>{asset.name} on {asset.network}</strong>
          </div>
        </div>
        <div className="address-box">
          <span>Backend-assigned deposit address</span>
          <code>{asset.depositAddress}</code>
          {asset.memoOrTag && (
            <>
              <span>Memo / tag</span>
              <code>{asset.memoOrTag}</code>
            </>
          )}
          <button className="portal-secondary" onClick={copyAddress}><LuCopy /> {copied ? "Copied" : "Copy address"}</button>
        </div>
        <ul className="instruction-list">
          <li>Only deposit {asset.symbol} on the {asset.network} network.</li>
          <li>Deposits may require blockchain confirmations before review.</li>
          <li>Sending the wrong asset or network may result in permanent loss.</li>
          <li>This address is assigned by admin/backend and is not generated in the frontend.</li>
        </ul>
        <div className="send-form">
          <div className="security-note">
            <LuCircleAlert />
            After sending funds, submit the transaction hash for admin review. Deposits are verified manually before approval.
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Network</label>
              <input value={form.network} readOnly aria-readonly="true" />
            </div>
            <div className="field">
              <label>Amount deposited</label>
              <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" inputMode="decimal" />
              {invalidAmount && <small className="field-error">Enter the amount you deposited.</small>}
            </div>
          </div>
          <div className="field">
            <label>Transaction hash</label>
            <input className="mono" value={form.txHash} onChange={(event) => setForm({ ...form, txHash: event.target.value })} placeholder="Paste blockchain transaction hash" />
            {form.txHash && !txHashLooksValid && <small className="field-error">Enter a complete transaction hash.</small>}
          </div>
          {submitError && <div className="auth-alert danger">{submitError}</div>}
          <button className="portal-primary" disabled={!canSubmit} onClick={submitDepositReview}>
            {submitting ? "Submitting..." : "Submit deposit for review"}
          </button>
        </div>
      </div>
      )}
    </ModalShell>
  );
}

function WithdrawModal({ asset, onClose }) {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ address: "", network: networkForDashboardAsset(asset?.symbol, asset?.network), amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [requestTx, setRequestTx] = useState(null);
  const amount = Number(form.amount);
  const fee = asset ? Math.max(asset.price * 0.00008, 1.25) : 0;
  const invalidAmount = form.amount && (Number.isNaN(amount) || amount <= 0 || amount > asset.balance);
  const canReview = form.address.trim().length > 12 && form.network && amount > 0 && amount <= asset.balance && !submitting;

  useEffect(() => {
    if (!asset) return;
    setForm({
      address: "",
      network: networkForDashboardAsset(asset.symbol, asset.network),
      amount: "",
    });
    setStep("form");
    setSubmitError("");
    setRequestTx(null);
    setSubmitting(false);
  }, [asset?.id, asset?.symbol, asset?.network]);

  const submitWithdrawal = async () => {
    if (!canReview) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const created = await createDashboardWithdrawalRequest({
        asset: asset.symbol,
        amount: form.amount,
        network: form.network,
        address: form.address,
      });
      setRequestTx(created);
      setStep("pending");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to submit withdrawal request."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!asset) return null;

  return (
    <ModalShell title={`Withdraw / Send ${asset.symbol}`} onClose={onClose}>
      {step === "form" ? (
        <div className="send-form">
          <div className="field">
            <label>Recipient wallet address</label>
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Enter recipient address" />
            {form.address && form.address.length <= 12 && <small className="field-error">Enter a complete recipient wallet address.</small>}
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Network</label>
              <input value={form.network} readOnly aria-readonly="true" />
            </div>
            <div className="field">
              <label>Amount</label>
              <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" inputMode="decimal" />
              {invalidAmount && <small className="field-error">Amount must be within the available balance.</small>}
            </div>
          </div>
          <div className="send-summary">
            <span>Available balance <strong>{formatNumber(asset.balance)} {asset.symbol}</strong></span>
            <span>Estimated fee <strong>{formatCurrency(fee)}</strong></span>
          </div>
          <div className="security-note warning">
            <LuCircleAlert />
            Withdrawals are reviewed for ownership, sanctions, and recovery-case compliance before release.
          </div>
          <button className="portal-primary" disabled={!canReview} onClick={() => setStep("review")}>
            Review transaction
          </button>
        </div>
      ) : step === "review" ? (
        <div className="review-step">
          <IconTile tone="accent"><LuShieldCheck /></IconTile>
          <h4>Review transaction request</h4>
          <div className="kv"><span className="k">Asset</span><span className="v">{asset.name}</span></div>
          <div className="kv"><span className="k">Recipient</span><span className="v">{form.address}</span></div>
          <div className="kv"><span className="k">Network</span><span className="v">{form.network}</span></div>
          <div className="kv"><span className="k">Amount</span><span className="v">{form.amount} {asset.symbol}</span></div>
          <div className="kv"><span className="k">Estimated fee</span><span className="v">{formatCurrency(fee)}</span></div>
          {submitError && <div className="auth-alert danger">{submitError}</div>}
          <div className="modal-actions">
            <button className="portal-secondary" disabled={submitting} onClick={() => setStep("form")}>Back</button>
            <button className="portal-primary" disabled={submitting} onClick={submitWithdrawal}>{submitting ? "Submitting..." : "Submit for review"}</button>
          </div>
        </div>
      ) : (
        <div className="review-step">
          <IconTile tone="accent"><LuShieldCheck /></IconTile>
          <h4>Withdrawal pending review</h4>
          <p className="muted">Your withdrawal request has been logged for admin compliance review. Payment is released manually only after ownership and case checks are complete.</p>
          <div className="kv"><span className="k">Request ID</span><span className="v mono">{requestTx?.transactionId || requestTx?.transaction_id || "Pending"}</span></div>
          <div className="kv"><span className="k">Status</span><span className="v"><Badge s={requestTx?.statusLabel || "Pending"} /></span></div>
          <div className="kv"><span className="k">Amount</span><span className="v">{form.amount} {asset.symbol}</span></div>
          <div className="kv"><span className="k">Recipient</span><span className="v mono">{form.address}</span></div>
          <div className="security-note">
            <LuCircleAlert />
            The request will appear in your transaction history as pending while the admin team reviews it.
          </div>
          <div className="modal-actions">
            <button className="portal-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function AssetRow({ asset, onSelect, onDeposit, onWithdraw, compact = false }) {
  const positive = asset.change24h >= 0;
  const openFromKeyboard = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(asset);
    }
  };

  return (
    <div
      className={`asset-row ${compact ? "compact" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(asset)}
      onKeyDown={openFromKeyboard}
    >
      <div className="asset-id">
        <AssetLogo asset={asset} />
        <div>
          <strong>{asset.name}</strong>
          <span>{asset.symbol} · {asset.network}</span>
        </div>
      </div>
      <div className="asset-price">
        {formatCurrency(asset.price)}
        {asset.isLive && <small>Live</small>}
      </div>
      <div className={positive ? "change-up" : "change-down"}>{positive ? "+" : ""}{asset.change24h}%</div>
      {!compact && <div>{formatCurrency(asset.value)}</div>}
      {!compact && <MiniLineChart data={asset.chartData} positive={positive} label={`${asset.symbol} trend`} />}
      <div className="asset-actions" onClick={(event) => event.stopPropagation()}>
        <button onClick={() => onDeposit(asset)}>Deposit</button>
        <button onClick={() => onWithdraw(asset)}>Send</button>
      </div>
    </div>
  );
}

function StockAssetRow({ asset, onOpen }) {
  const shares = Number(asset.balance || 0);
  const value = Number(asset.value || 0);
  const unitPrice = shares > 0 ? value / shares : 0;
  const openFromKeyboard = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen?.(asset);
    }
  };

  return (
    <div
      className="asset-row stock-asset-row"
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(asset)}
      onKeyDown={openFromKeyboard}
      aria-label={`Open ${asset.name} stock position`}
    >
      <div className="asset-id">
        <AssetIcon asset={asset} size={36} />
        <div>
          <strong>{asset.name}</strong>
          <span>{asset.symbol} - Stock</span>
        </div>
      </div>
      <div className="asset-price">
        {formatCurrency(unitPrice)}
        <small>Stock</small>
      </div>
      <div className="stock-share-count">{formatNumber(shares)} shares</div>
      <div className="stock-position-value">{formatCurrency(value)}</div>
      <div className="stock-asset-type">
        <span>Equity</span>
      </div>
      <div className="asset-actions" onClick={(event) => event.stopPropagation()}>
        <button onClick={() => onOpen?.(asset)}>Open</button>
      </div>
    </div>
  );
}

function OverviewScreen({ setActive, assets, stockAssets = [], onSelect, onSelectStock }) {
  const { user } = useSession();
  const [displayCurrency, setDisplayCurrency] = useState(displayCurrencies[0]);
  const [overview, setOverview] = useState({ stats: {}, loading: true, error: "" });
  const recentReports = useCaseReports({ clientId: user?.id, role: "client" }).slice(0, 4);
  const adminAddedAssets = assets.filter((asset) => {
    const balance = Number(asset.balance || 0);
    const value = Number(asset.value || 0);
    return balance > 0 || value > 0;
  });
  const assignedStockHoldings = stockAssets.filter((asset) => Number(asset.balance || 0) > 0 || Number(asset.value || 0) > 0);
  const totalValue = adminAddedAssets.reduce((sum, asset) => sum + asset.value, 0)
    + assignedStockHoldings.reduce((sum, asset) => sum + asset.value, 0);
  const topAssets = adminAddedAssets.slice(0, 4);
  const convertedTotal = totalValue * displayCurrency.rate;
  useEffect(() => {
    let alive = true;
    async function loadOverview() {
      try {
        const data = await getDashboardOverview();
        if (alive) setOverview({ stats: data?.stats || {}, loading: false, error: "" });
      } catch (error) {
        if (alive) setOverview({ stats: {}, loading: false, error: getErrorMessage(error, "Unable to load dashboard data.") });
      }
    }
    loadOverview();
    return () => {
      alive = false;
    };
  }, []);
  const stats = overview.stats || {};
  return (
    <div className="screen-stack">
      <section className="portal-kpis">
        {[
          ["Portfolio value", formatDisplayCurrency(convertedTotal, displayCurrency.code), "", LuWallet],
          ["Total cases", overview.loading ? "..." : stats.total_cases ?? 0, "Backend synced", LuFileText],
          ["Active cases", overview.loading ? "..." : stats.active_cases ?? 0, "In progress", LuChartLine],
          ["Resolved cases", overview.loading ? "..." : stats.resolved_cases ?? 0, "Closed or resolved", LuFileCheck2],
        ].map(([label, value, sub, Icon], index) => (
          <div className={`premium-panel portal-kpi ${index === 0 ? "portal-kpi-wide" : "portal-kpi-clean"}`} key={label}>
            <div className="portal-kpi-copy">
              <IconTile><Icon /></IconTile>
              <span>{label}</span>
              {sub && <small>{sub}</small>}
              {index === 0 && <div className="currency-switcher" aria-label="Display currency">
                {displayCurrencies.map((currency)=>(
                  <button
                    key={currency.code}
                    className={displayCurrency.code === currency.code ? "active" : ""}
                    onClick={()=>setDisplayCurrency(currency)}
                  >
                    {currency.label}
                  </button>
                ))}
              </div>}
            </div>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      {overview.error && <div className="portal-inline-state">{overview.error}</div>}
      <section className="portal-two-col">
        <div className="premium-panel">
          <SectionHeader eyebrow="Wallet summary" title="Primary holdings" action={<button className="portal-secondary" onClick={() => setActive("wallet")}>Open wallet</button>} />
          <div className="holdings-grid">
            {topAssets.map((asset) => (
              <button className="holding-card" key={asset.id || asset.symbol} onClick={() => onSelect(asset)}>
                <AssetLogo asset={asset} />
                <div><strong>{asset.symbol}</strong><span className={asset.change24h >= 0 ? "is-up" : "is-down"}>{asset.change24h >= 0 ? "+" : ""}{asset.change24h}%</span></div>
                <em className="holding-value">{formatCurrency(asset.value)}</em>
              </button>
            ))}
            {!topAssets.length && <EmptyState title="No admin-added assets" copy="Primary holdings will appear after an admin adds asset balances to your profile." />}
          </div>
        </div>
        <div className="premium-panel">
          <SectionHeader eyebrow="Recent case reports" title="Submitted cases" action={<button className="portal-secondary" onClick={() => setActive("report-case")}>View cases</button>} />
          <div className="activity-list">
            {recentReports.map((report) => (
              <div key={report.id}>
                <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(report.updatedAt))}</span>
                <p>{report.title}</p>
                <Badge s={report.statusLabel} />
              </div>
            ))}
            {!recentReports.length && <EmptyState title="No case reports" copy="Submitted reports will appear here." />}
          </div>
        </div>
      </section>
      <section className="premium-panel">
        <SectionHeader
          eyebrow="Asset list"
          title="Stock assets"
          action={<button className="portal-secondary" onClick={() => setActive("stocks")}>Open stocks</button>}
        />
        <div className="asset-list">
          {assignedStockHoldings.map((asset) => (
            <StockAssetRow key={asset.id || asset.symbol} asset={asset} onOpen={onSelectStock} />
          ))}
          {!assignedStockHoldings.length && <EmptyState title="No stock holdings assigned" copy="Stock positions will appear after an admin adds them to your portfolio." />}
        </div>
      </section>
    </div>
  );
}

function ReportCaseScreen() {
  const { user } = useSession();
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [caseForm, setCaseForm] = useState({
    title: "",
    category: reportCategories[0],
    description: "",
    amountInvolved: "",
    assetType: "",
    walletAddressOrTxHash: "",
    incidentDate: "",
    preferredContactMethod: "Email",
  });
  const [caseNotice, setCaseNotice] = useState("");
  const reports = useCaseReports({ clientId: user?.id, role: "client" });
  const selectedReport = reports.find((report) => report.id === selectedReportId);
  const canSubmitCase = caseForm.title.trim() && caseForm.description.trim().length >= 12;
  const setCaseField = (key, value) => setCaseForm((current) => ({ ...current, [key]: value }));
  const onFileSelected = (event) => setSelectedFiles(Array.from(event.target.files || []));
  const submitCase = async (event) => {
    event.preventDefault();
    if (!canSubmitCase) {
      setCaseNotice("Complete the case title and complaint details.");
      return;
    }
    try {
      const report = await createCaseReport({ client: user, form: caseForm, files: selectedFiles });
      setSelectedReportId(report.id);
      setCaseForm({ title: "", category: reportCategories[0], description: "", amountInvolved: "", assetType: "", walletAddressOrTxHash: "", incidentDate: "", preferredContactMethod: "Email" });
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      setCaseNotice("Case report submitted for review.");
    } catch (error) {
      setCaseNotice(error.message || "Unable to submit case report.");
    }
  };

  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Report Case" title="Report case" copy="Submit a case and upload supporting documents in one workflow." action={<button className="portal-primary" onClick={() => setShowForm((value) => !value)}><LuPlus /> Submit new case</button>} />
      {caseNotice && <div className="portal-inline-state">{caseNotice}</div>}
      {showForm && (
        <section className="premium-panel">
          <SectionHeader eyebrow="New report" title="Case complaint details" />
          <form className="claim-create-form" onSubmit={submitCase}>
            <div className="field-grid">
              <div className="field"><label>Case title</label><input value={caseForm.title} onChange={(event) => setCaseField("title", event.target.value)} placeholder="Brief case title" /></div>
              <div className="field"><label>Case category</label><select value={caseForm.category} onChange={(event) => setCaseField("category", event.target.value)}>{reportCategories.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="field"><label>Amount involved</label><input value={caseForm.amountInvolved} onChange={(event) => setCaseField("amountInvolved", event.target.value)} placeholder="$25,000" /></div>
              <div className="field"><label>Asset type</label><input value={caseForm.assetType} onChange={(event) => setCaseField("assetType", event.target.value)} placeholder="BTC, ETH, bank record..." /></div>
              <div className="field"><label>Wallet address / transaction hash</label><input value={caseForm.walletAddressOrTxHash} onChange={(event) => setCaseField("walletAddressOrTxHash", event.target.value)} placeholder="Optional wallet or TX hash" /></div>
              <div className="field"><label>Date of incident</label><input type="date" value={caseForm.incidentDate} onChange={(event) => setCaseField("incidentDate", event.target.value)} /></div>
              <div className="field"><label>Preferred contact method</label><select value={caseForm.preferredContactMethod} onChange={(event) => setCaseField("preferredContactMethod", event.target.value)}><option>Email</option><option>Phone</option><option>Portal message</option></select></div>
            </div>
            <div className="field"><label>Description / complaint details</label><textarea rows="4" value={caseForm.description} onChange={(event) => setCaseField("description", event.target.value)} placeholder="Describe what happened and what records you can provide." /></div>
            <div className="document-upload-table">
              <div className="document-upload-row summary">
                <span>Documents / evidence</span>
                <strong>{selectedFiles.length ? `${selectedFiles.length} file(s) selected` : "No file selected"}</strong>
                <button type="button" onClick={() => fileInputRef.current?.click()}><LuUpload /> Upload files</button>
              </div>
              <input ref={fileInputRef} type="file" hidden multiple onChange={onFileSelected} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            </div>
            <div className="modal-actions">
              <button className="portal-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="portal-primary" type="submit" disabled={!canSubmitCase}><LuSend /> Submit case</button>
            </div>
          </form>
        </section>
      )}
      <section className="premium-panel">
        <SectionHeader eyebrow="Submitted cases" title="Case reports" />
        <div className="portal-table report-cases-table">
          {reports.map((report) => (
            <div className="portal-table-row report-case-row" key={report.id}>
              <div className="report-case-primary">
                <strong className="report-case-title">{report.title}</strong>
              </div>
              <span className="report-case-category">{report.category}</span>
              <Badge s={report.statusLabel} />
              <span className="report-case-time">{formatTicketTime(report.updatedAt)}</span>
              <button className="ticket-open-link" onClick={() => setSelectedReportId(report.id)}>Open <LuChevronRight /></button>
            </div>
          ))}
          {!reports.length && <EmptyState title="No case reports" copy="Submit a case report to begin review." />}
        </div>
      </section>
      {selectedReport && (
        <ModalShell title="Case report" onClose={() => setSelectedReportId(null)}>
          <div className="case-report-detail-modal">
            <div className="case-report-summary-row">
              <div className="case-report-heading">
                <span className="mono">{selectedReport.id}</span>
                <strong>{selectedReport.title}</strong>
                <small>{selectedReport.category}</small>
              </div>
              <Badge s={selectedReport.statusLabel} />
            </div>
            <div className="case-report-records">
              <div><span>Submitted</span><strong>{formatTicketTime(selectedReport.createdAt)}</strong></div>
              <div><span>Last updated</span><strong>{formatTicketTime(selectedReport.updatedAt)}</strong></div>
              <div className="case-report-text-row"><span>Description</span><p>{selectedReport.description}</p></div>
              {selectedReport.adminNote && <div className="case-report-text-row"><span>Admin note</span><p>{selectedReport.adminNote}</p></div>}
            </div>
            {selectedReport.documents.length > 0 && (
              <div className="case-report-documents">
                <div className="case-report-documents-head">
                  <span>Documents</span>
                  <strong>{selectedReport.documents.length}</strong>
                </div>
                <div className="case-report-document-list">
                  {selectedReport.documents.map((doc) => (
                    <div className="case-report-document-row" key={doc.id}>
                      <LuFileText />
                      <strong>{doc.documentName}</strong>
                      <span>{doc.size}</span>
                      <em>{new Date(doc.uploadedAt).toLocaleDateString()}</em>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function WalletScreen({ assets, stockAssets = [], onSelect, onSelectStock, onDeposit, onWithdraw, setActive }) {
  const [walletAction, setWalletAction] = useState("");
  const assignedStockHoldings = stockAssets.filter((asset) => Number(asset.balance || 0) > 0 || Number(asset.value || 0) > 0);
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
    + assignedStockHoldings.reduce((sum, asset) => sum + asset.value, 0);
  const canWithdraw = assets.some((asset) => Number(asset.balance || 0) > 0);
  const chooseTransferAsset = (asset) => {
    const action = walletAction;
    setWalletAction("");
    if (action === "deposit") onDeposit(asset);
    if (action === "withdraw") onWithdraw(asset);
  };

  return (
    <div className="screen-stack">
      <SectionHeader
        eyebrow="Wallet management"
        title="Your wallet"
      />
      <section className="wallet-management premium-panel">
        <div>
          <IconTile tone="accent"><LuWallet /></IconTile>
          <h3>{formatCurrency(totalValue)}</h3>
        </div>
        <div className="wallet-controls">
          <button className="portal-primary wallet-deposit-btn" disabled={!assets.length} onClick={() => setWalletAction("deposit")}><LuPlus /> Deposit</button>
          <button className="portal-secondary" disabled={!canWithdraw} onClick={() => setWalletAction("withdraw")}><LuSend /> Withdraw</button>
        </div>
      </section>
      <section className="premium-panel">
        <SectionHeader eyebrow="Asset list" title="Crypto assets" />
        <div className="asset-list">
          {assets.map((asset) => (
            <AssetRow key={asset.id || asset.symbol} asset={asset} onSelect={onSelect} onDeposit={onDeposit} onWithdraw={onWithdraw} />
          ))}
          {!assets.length && <EmptyState title="No assets assigned" copy="Only admin-added assets are shown here." />}
        </div>
      </section>
      <section className="premium-panel">
        <SectionHeader
          eyebrow="Asset list"
          title="Stock assets"
          action={<button className="portal-secondary" onClick={() => setActive?.("stocks")}>Trade stocks</button>}
        />
        <div className="asset-list">
          {assignedStockHoldings.map((asset) => (
            <StockAssetRow key={asset.id || asset.symbol} asset={asset} onOpen={onSelectStock} />
          ))}
          {!assignedStockHoldings.length && <EmptyState title="No stock holdings assigned" copy="Assigned stock positions will appear here separately from wallet assets." />}
        </div>
      </section>
      <WalletTransferAssetPicker
        mode={walletAction}
        assets={assets}
        onClose={() => setWalletAction("")}
        onChoose={chooseTransferAsset}
      />
    </div>
  );
}

function TransactionsScreen() {
  const { user } = useSession();
  const clientTransactions = useClientTransactions({ clientId: user?.id, role: "client" });
  const [selectedTx, setSelectedTx] = useState(null);
  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Transactions" title="Wallet transaction history" copy="Deposits, withdrawals, swaps, and wallet operations." />
      <section className="premium-panel">
        <SectionHeader eyebrow="Ledger" title="Recent transactions" />
        <div className="portal-table transaction-table">
          {clientTransactions.map((tx) => (
            <button className="portal-table-row" key={tx.id} onClick={() => setSelectedTx(tx)}>
              <strong>{tx.typeLabel}</strong>
              <span className="tx-asset"><AssetIcon asset={assetForTransaction(tx)} size={24} /> {tx.asset}</span>
              <span className={`tx-amount ${tx.displayAmount.startsWith("+") ? "is-up" : tx.displayAmount.startsWith("-") ? "is-down" : ""}`}>{tx.displayAmount}</span>
              <em>{tx.fiatValue}</em>
              <Badge s={tx.statusLabel} />
            </button>
          ))}
          {!clientTransactions.length && <EmptyState title="No transactions" copy="Admin-created transaction records will appear here." />}
        </div>
      </section>
      {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}

function assetForTransaction(tx) {
  if (tx.type === "stock_buy" || tx.type === "stock_sell") {
    return getStockAssetMeta(tx.asset);
  }
  return { type: "crypto", ...(cryptoAssets.find((asset) => asset.symbol === tx.asset) || cryptoAssets[0]) };
}

function chartAssetForTransaction(tx) {
  const base = cryptoAssets.find((asset) => asset.symbol === tx.asset) || {};
  return {
    ...base,
    symbol: tx.asset || base.symbol,
    name: base.name || tx.asset || "Crypto asset",
    network: tx.network || base.network,
  };
}

function TransactionDetailModal({ tx, onClose }) {
  const chartAsset = chartAssetForTransaction(tx);
  const isStockReview = tx.type === "stock_buy" || tx.type === "stock_sell";
  return (
    <ModalShell title="Transaction details" onClose={onClose}>
      <div className="transaction-detail-modal">
        <div className="ticket-meta-table">
          <div><span>Transaction ID</span><strong className="mono">{tx.transactionId || tx.id}</strong></div>
          <div><span>Type</span><strong>{tx.typeLabel || tx.type}</strong></div>
          <div><span>Asset</span><strong>{tx.asset}</strong></div>
          <div><span>Amount</span><strong className={tx.displayAmount?.startsWith("+") ? "is-up" : tx.displayAmount?.startsWith("-") ? "is-down" : ""}>{tx.displayAmount || tx.amount}</strong></div>
          <div><span>Value</span><strong>{tx.fiatValue || tx.value}</strong></div>
          <div><span>Status</span><strong><Badge s={tx.statusLabel || tx.status} /></strong></div>
          <div><span>Date</span><strong>{tx.transactionDate?.includes?.("T") ? new Date(tx.transactionDate).toLocaleDateString() : tx.transactionDate || tx.date}</strong></div>
          {tx.network && <div><span>Network</span><strong>{tx.network}</strong></div>}
          {tx.txHash && <div><span>Transaction hash</span><strong className="mono">{tx.txHash}</strong></div>}
          {tx.clientNote && <div><span>Note</span><strong>{tx.clientNote}</strong></div>}
        </div>
        {!isStockReview && <CryptoChartDisplay asset={chartAsset} height={360} />}
      </div>
    </ModalShell>
  );
}

function SwapScreen({ assets = [] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableAssets = useMemo(() => assets.filter((asset) => asset.visible !== false), [assets]);
  const fundedAssets = useMemo(() => availableAssets.filter((asset) => Number(asset.balance || 0) > 0), [availableAssets]);

  useEffect(() => {
    if (!fundedAssets.length) {
      setFrom("");
      return;
    }
    if (!fundedAssets.some((asset) => asset.symbol === from)) {
      setFrom(fundedAssets[0].symbol);
    }
  }, [from, fundedAssets]);

  useEffect(() => {
    const destinations = availableAssets.filter((asset) => asset.symbol !== from);
    if (!destinations.length) {
      setTo("");
      return;
    }
    if (!destinations.some((asset) => asset.symbol === to)) {
      setTo(destinations[0].symbol);
    }
  }, [availableAssets, from, to]);

  const fromAsset = availableAssets.find((asset) => asset.symbol === from);
  const toAsset = availableAssets.find((asset) => asset.symbol === to);
  const destinationAssets = availableAssets.filter((asset) => asset.symbol !== from);
  const numericAmount = Number(amount);
  const sourceBalance = Number(fromAsset?.balance || 0);
  const estimate = fromAsset && toAsset && numericAmount > 0 && toAsset.price
    ? (numericAmount * fromAsset.price) / toAsset.price
    : 0;
  const fiatEstimate = fromAsset && numericAmount > 0 ? numericAmount * fromAsset.price : 0;
  const amountError = numericAmount > sourceBalance
    ? "Amount exceeds the available balance."
    : numericAmount < 0
      ? "Enter a positive amount."
      : "";

  const submitSwapReview = async () => {
    if (submitting) return;
    if (!fromAsset || !toAsset || !numericAmount || numericAmount <= 0) {
      setError("Choose assets and enter a valid amount.");
      return;
    }
    if (numericAmount > sourceBalance) {
      setError("Amount exceeds the available balance.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    setError("");
    try {
      const response = await createDashboardSwapRequest({
        from_asset: from,
        to_asset: to,
        amount,
      });
      const quote = response?.quote || {};
      const received = Number(quote.receive_amount || estimate || 0);
      setNotice(`Swap request submitted for admin review. Estimated receive: ${formatNumber(received)} ${to}.`);
      setAmount("");
    } catch (error) {
      setError(getErrorMessage(error, "Unable to request swap review."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen-stack">
      <div className="swap-section-head">
        <SectionHeader eyebrow="Compliance-controlled swap" title="Review asset conversion request" />
      </div>
      {notice && <div className="portal-inline-state">{notice}</div>}
      {error && <div className="portal-inline-error">{error}</div>}
      <section className="swap-shell premium-panel">
        {!fundedAssets.length ? (
          <EmptyState title="No swap balance" copy="Admin must add balance to one of your wallet assets before swaps can be requested." />
        ) : (
          <div className="swap-form">
            <div className="field">
              <label>From asset</label>
              <select value={from} onChange={(event) => setFrom(event.target.value)}>
                {fundedAssets.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {formatNumber(asset.balance)} available
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Amount</label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder={`Max ${formatNumber(sourceBalance)} ${from || ""}`}
              />
              {amountError && <small className="field-error">{amountError}</small>}
            </div>
            <div className="swap-divider"><LuRepeat2 /></div>
            <div className="field">
              <label>To asset</label>
              <select value={to} onChange={(event) => setTo(event.target.value)} disabled={!destinationAssets.length}>
                {destinationAssets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>)}
              </select>
            </div>
            <div className="swap-estimate">
              <span>Estimated receive</span>
              <strong>{formatNumber(estimate)} {to}</strong>
              <small>Estimated value: {formatCurrency(fiatEstimate)}. Admin review required before balances change.</small>
            </div>
            <button
              className="portal-primary"
              onClick={submitSwapReview}
              disabled={submitting || !numericAmount || numericAmount <= 0 || numericAmount > sourceBalance || !destinationAssets.length}
            >
              {submitting ? "Sending..." : "Review swap"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function MarketsScreen({ marketAssets = [], onSelect, onDeposit, onWithdraw }) {
  const [query, setQuery] = useState("");
  const availableAssets = useMemo(() => (marketAssets.length ? marketAssets : cryptoAssets), [marketAssets]);
  const [selectedSymbol, setSelectedSymbol] = useState(availableAssets[0]?.symbol || "BTC");
  const filtered = useMemo(
    () => availableAssets.filter((asset) => `${asset.name} ${asset.symbol}`.toLowerCase().includes(query.toLowerCase())),
    [availableAssets, query],
  );
  const selected = availableAssets.find((asset) => asset.symbol === selectedSymbol) || filtered[0] || availableAssets[0];

  useEffect(() => {
    if (!availableAssets.length) return;
    if (!availableAssets.some((asset) => asset.symbol === selectedSymbol)) {
      setSelectedSymbol(availableAssets[0].symbol);
    }
  }, [availableAssets, selectedSymbol]);

  const chooseMarketAsset = (asset) => {
    setSelectedSymbol(asset.symbol);
    onSelect(asset);
  };

  return (
    <div className="screen-stack">
      <SectionHeader
        eyebrow="Markets"
        title="Monitored digital asset markets"
      />
      <section className="markets-layout">
        <div className="premium-panel">
          <div className="market-toolbar">
            <div className="portal-search"><LuSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets" /></div>
            <button><LuFilter /> Filter</button>
          </div>
          <div className="market-list">
            {filtered.length ? filtered.map((asset) => (
              <button className={`market-row ${selected?.symbol === asset.symbol ? "active" : ""}`} key={asset.symbol} onClick={() => chooseMarketAsset(asset)}>
                <AssetLogo asset={asset} />
                <strong>{asset.symbol}</strong>
                <span>{formatCurrency(asset.price)}</span>
                <em className={asset.change24h >= 0 ? "is-up" : "is-down"}>{asset.change24h >= 0 ? "+" : ""}{asset.change24h}%</em>
                <small>{formatCurrency(asset.marketCap, true)} cap</small>
              </button>
            )) : <EmptyState title="No assets found" copy="Try a different symbol or asset name." />}
          </div>
        </div>
        {selected ? (
          <aside className="premium-panel market-detail">
            <div className="asset-detail-title">
              <AssetLogo asset={selected} size="lg" />
              <div><span>{selected.symbol}</span><h4>{selected.name}</h4></div>
            </div>
            <MarketSnapshotPanel asset={selected} />
            <div className="market-stats">
              <div><span>Price</span><strong>{formatCurrency(selected.price)}</strong></div>
              <div><span>24h</span><strong className={selected.change24h >= 0 ? "is-up" : "is-down"}>{selected.change24h >= 0 ? "+" : ""}{selected.change24h}%</strong></div>
              <div><span>Market cap</span><strong>{formatCurrency(selected.marketCap, true)}</strong></div>
              <div><span>Volume</span><strong>{formatCurrency(selected.volume24h, true)}</strong></div>
            </div>
            <CryptoChartDisplay asset={selected} height={340} />
            <div className="detail-actions">
              <button className="portal-primary" onClick={() => onDeposit(selected)}>Deposit</button>
              <button className="portal-secondary" onClick={() => onWithdraw(selected)}>Withdraw</button>
              <button className="portal-secondary" onClick={() => onSelect(selected)}>Details</button>
            </div>
          </aside>
        ) : (
          <aside className="premium-panel market-detail">
            <EmptyState title="No market selected" copy="Choose an asset to view market details." />
          </aside>
        )}
      </section>
    </div>
  );
}

const stockFilterOptions = ["All", "Gainers", "Losers", "Most Active"];
const stockSortOptions = [
  ["changePercent", "Change %"],
  ["price", "Price"],
  ["volume", "Volume"],
  ["symbol", "Symbol"],
];

function stockTone(stock) {
  const change = Number(stock?.changePercent) || 0;
  if (change > 0.05) return "up";
  if (change < -0.05) return "down";
  return "flat";
}

function chartTick(value, range) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  if (range === "1D") {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(date);
  }
  if (range === "5D") {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function stockPerformanceNote(stock) {
  if (!stock) return "Select a stock to review current trading activity.";
  const changePercent = Number(stock.changePercent) || 0;
  const price = Number(stock.price) || 0;
  const high = Number(stock.high);
  const low = Number(stock.low);
  const volume = Number(stock.volume);
  const rangePosition = Number.isFinite(high) && Number.isFinite(low) && high > low
    ? Math.round(((price - low) / (high - low)) * 100)
    : null;
  const direction = Math.abs(changePercent) < 0.05 ? "is trading near flat" : changePercent > 0 ? "is outperforming today" : "is under pressure today";
  const rangeCopy = rangePosition == null ? "intraday range data is limited" : `it sits ${rangePosition}% through today's high-low range`;
  const volumeCopy = Number.isFinite(volume) && volume > 0 ? `on ${formatCompactNumber(volume)} shares reported` : "with volume awaiting provider confirmation";
  return `${stock.symbol} ${direction}; ${rangeCopy} ${volumeCopy}.`;
}

function StockSummaryCard({ label, value, meta, tone = "neutral", loading = false }) {
  if (loading) {
    return (
      <div className="stock-summary-card loading" aria-label={`${label} loading`}>
        <span className="stock-skeleton-line short" />
        <span className="stock-skeleton-line wide" />
        <span className="stock-skeleton-line" />
      </div>
    );
  }

  return (
    <div className={`stock-summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}

function StockTableSkeleton() {
  return (
    <div className="stock-table-body" aria-label="Loading stock rows">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="stock-table-row skeleton" key={index}>
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <span className="stock-skeleton-line" key={cellIndex} />
          ))}
        </div>
      ))}
    </div>
  );
}

function StockChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  return (
    <div className="stock-chart-tooltip">
      <strong>{formatNullableCurrency(point.close)}</strong>
      <span>{chartTick(label, "1M")}</span>
      <small>Volume {formatCompactNumber(point.volume)}</small>
    </div>
  );
}

function StockPriceChart({ stock, series, range, onRangeChange, loading = false, error = "" }) {
  const tone = stockTone(stock);
  const data = series?.length ? series : stock?.chart || [];
  const gradientId = `stockArea${String(stock?.symbol || "chart").replace(/[^a-z0-9]/gi, "")}`;
  const stroke = tone === "down" ? "#E0826B" : tone === "flat" ? "#A8B0B6" : "var(--accent-2)";

  return (
    <div className="stock-chart-panel">
      <div className="stock-chart-head">
        <div className="stock-chart-title">
          {stock && <AssetIcon asset={stock} size={34} />}
          <div>
            <span>Performance chart</span>
            <strong>{stock?.symbol || "Symbol"} price movement</strong>
          </div>
        </div>
        <div className="stock-timeframes" aria-label="Stock chart timeframe">
          {STOCK_RANGES.map((option) => (
            <button
              key={option}
              className={range === option ? "active" : ""}
              onClick={() => onRangeChange(option)}
              aria-pressed={range === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="stock-chart-canvas">
        {loading ? (
          <div className="stock-chart-loading" aria-live="polite">
            <span className="stock-skeleton-line wide" />
            <span className="stock-skeleton-graph" />
          </div>
        ) : error ? (
          <div className="stock-chart-state">
            <LuCircleAlert />
            <span>{error}</span>
          </div>
        ) : data.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 18, right: 6, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-soft)" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => chartTick(value, range)}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
                stroke="var(--muted)"
                fontSize={11}
              />
              <YAxis
                orientation="right"
                tickFormatter={(value) => formatNullableCurrency(value, value >= 100000)}
                tickLine={false}
                axisLine={false}
                width={70}
                stroke="var(--muted)"
                fontSize={11}
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip content={<StockChartTooltip />} />
              <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={2.5} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="stock-chart-state">
            <LuChartLine />
            <span>No chart data is available for this range.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StockDetailPanel({ stock, range, setRange, series, loading, error, modal = false, actions = null }) {
  if (!stock) {
    return (
      <aside className={`${modal ? "" : "premium-panel"} stock-detail-panel ${modal ? "in-modal" : ""}`}>
        <EmptyState title="No stock selected" copy="Choose a symbol to review price action and market details." />
      </aside>
    );
  }

  const tone = stockTone(stock);
  const stats = [
    ...(stock.holding ? [["Owned shares", `${formatNumber(stock.holding.balance)} shares`], ["Position value", formatCurrency(stock.holding.value)]] : []),
    ["Open", formatNullableCurrency(stock.open)],
    ["Day high", formatNullableCurrency(stock.high)],
    ["Day low", formatNullableCurrency(stock.low)],
    ["Previous close", formatNullableCurrency(stock.previousClose)],
    ["Volume", formatCompactNumber(stock.volume)],
    ["Market cap", formatNullableCurrency(stock.marketCap, true)],
    ["Exchange", stock.exchange || "N/A"],
  ];

  return (
    <aside className={`${modal ? "" : "premium-panel"} stock-detail-panel ${modal ? "in-modal" : ""}`}>
      <div className="stock-detail-headline">
        <div className="stock-detail-title">
          <AssetIcon asset={stock} size={42} />
          <div>
            <span>{stock.symbol}</span>
            <h4>{stock.companyName}</h4>
          </div>
        </div>
        {actions && <div className="stock-position-actions">{actions}</div>}
      </div>
      <div className="stock-price-strip">
        <strong>{formatNullableCurrency(stock.price)}</strong>
        <em className={`stock-change ${tone}`}>{formatPercent(stock.changePercent)}</em>
        <small>{formatNullableCurrency(stock.change)} today</small>
      </div>
      <StockPriceChart stock={stock} series={series} range={range} onRangeChange={setRange} loading={loading} error={error} />
      <div className="stock-detail-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="stock-performance-note">{stockPerformanceNote(stock)}</p>
    </aside>
  );
}

function StockPositionDetailModal({ asset, fundingAssets = [], onClose, onDeposit }) {
  const [quote, setQuote] = useState(null);
  const [range, setRange] = useState("1D");
  const [series, setSeries] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesError, setSeriesError] = useState("");
  const [tradeAction, setTradeAction] = useState("");
  const [tradeNotice, setTradeNotice] = useState("");

  useEffect(() => {
    if (!asset?.symbol) return undefined;
    let alive = true;
    setQuote(null);
    setSeries([]);
    setRange("1D");
    setSeriesLoading(true);
    setSeriesError("");
    setTradeAction("");
    setTradeNotice("");
    fetchStockBatch([asset.symbol], { range: "1D" })
      .then((payload) => {
        if (alive) setQuote(payload.stocks?.[0] || null);
      })
      .catch(() => {
        if (alive) setQuote(null);
      });
    return () => {
      alive = false;
    };
  }, [asset?.symbol]);

  useEffect(() => {
    if (!asset?.symbol) return undefined;
    let alive = true;
    setSeriesLoading(true);
    setSeriesError("");
    fetchStockTimeSeries(asset.symbol, range)
      .then((payload) => {
        if (alive) setSeries(payload.series || []);
      })
      .catch(() => {
        if (alive) {
          setSeries(quote?.chart || []);
          setSeriesError("");
        }
      })
      .finally(() => {
        if (alive) setSeriesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [asset?.symbol, quote?.chart, range]);

  if (!asset) return null;

  const shares = Number(asset.balance || 0);
  const positionPrice = shares > 0 ? Number(asset.value || 0) / shares : 0;
  const stock = {
    ...asset,
    ...quote,
    holding: asset,
    type: "stock",
    symbol: asset.symbol,
    name: asset.name,
    companyName: asset.companyName || asset.name,
    price: quote?.price ?? positionPrice,
    chart: quote?.chart || [],
  };

  return (
    <>
      <ModalShell title={`${asset.symbol} stock position`} onClose={onClose}>
        <div className="stock-position-modal">
          {tradeNotice && <div className="portal-inline-state">{tradeNotice}</div>}
          <StockDetailPanel
            stock={stock}
            range={range}
            setRange={setRange}
            series={series}
            loading={seriesLoading}
            error={seriesError}
            modal
            actions={(
              <>
                <button className="portal-primary" onClick={() => setTradeAction("buy")}>BUY</button>
                <button className="portal-secondary stock-position-sell" onClick={() => setTradeAction("sell")} disabled={shares <= 0}>SELL</button>
              </>
            )}
          />
        </div>
      </ModalShell>
      <StockBuyReviewModal
        stock={tradeAction === "buy" ? stock : null}
        fundingAssets={fundingAssets}
        onClose={() => setTradeAction("")}
        onSubmitted={setTradeNotice}
        onDeposit={() => {
          setTradeAction("");
          onDeposit?.();
        }}
      />
      <StockSellReviewModal
        stock={tradeAction === "sell" ? stock : null}
        onClose={() => setTradeAction("")}
        onSubmitted={setTradeNotice}
      />
    </>
  );
}

function StockBuyReviewModal({ stock, fundingAssets = [], onClose, onDeposit, onSubmitted }) {
  const [paymentAsset, setPaymentAsset] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!stock) return;
    setPaymentAsset(fundingAssets[0]?.symbol || "");
    setQuantity("1");
    setNote("");
    setNotice("");
    setError("");
  }, [stock?.symbol]);

  if (!stock) return null;

  const selectedFunding = fundingAssets.find((asset) => asset.symbol === paymentAsset) || fundingAssets[0];
  const hasFunding = fundingAssets.length > 0;
  const price = Number(stock.price);
  const quantityNumber = Number(quantity);
  const estimatedTotal = Number.isFinite(price) && Number.isFinite(quantityNumber) && quantityNumber > 0 ? price * quantityNumber : 0;
  const availableBalance = Number(selectedFunding?.balance || 0);
  const exceedsBalance = hasFunding && estimatedTotal > availableBalance;
  const invalidOrder = !hasFunding || !Number.isFinite(price) || price <= 0 || !quantityNumber || quantityNumber <= 0 || exceedsBalance;

  const submitBuyReview = async () => {
    if (invalidOrder || submitting) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const response = await createDashboardStockBuyRequest({
        stock_symbol: stock.symbol,
        stock_name: stock.companyName || stock.name,
        quantity,
        estimated_price: String(price),
        estimated_total: String(estimatedTotal),
        payment_asset: selectedFunding.symbol,
        note,
      });
      const order = response?.order || {};
      onSubmitted?.(`${stock.symbol} buy request sent for admin review. Estimated value: ${order.estimated_total || formatCurrency(estimatedTotal)}.`);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to submit stock buy request."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title={hasFunding ? "Review stock buy" : "Deposit required"} onClose={onClose}>
      <div className="stock-buy-modal">
        <AssetIcon asset={stock} size={42} />
        <div>
          <strong>{stock.symbol} buy request</strong>
          <p>
            {hasFunding
              ? "Choose the stablecoin balance and share quantity to send this stock buy request for admin review."
              : "Add USDC or USDT to your portfolio wallet before placing a stock buy request."}
          </p>
        </div>
        {hasFunding ? (
          <div className="stock-buy-form">
            {notice && <div className="portal-inline-state">{notice}</div>}
            {error && <div className="portal-inline-error">{error}</div>}
            <div className="field-grid">
              <label className="field">
                <span>Pay with</span>
                <select value={selectedFunding?.symbol || ""} onChange={(event) => setPaymentAsset(event.target.value)}>
                  {fundingAssets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {formatNumber(asset.balance)} available
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Shares</span>
                <input value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" placeholder="1" />
              </label>
            </div>
            <div className="stock-buy-quote">
              <div><span>Market price</span><strong>{formatNullableCurrency(price)}</strong></div>
              <div><span>Estimated value</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
              <div><span>Available</span><strong>{formatNumber(availableBalance)} {selectedFunding?.symbol}</strong></div>
            </div>
            {exceedsBalance && <div className="field-error">Estimated order value exceeds your selected stablecoin balance.</div>}
            {!Number.isFinite(price) || price <= 0 ? <div className="field-error">A stock price is required before this request can be reviewed.</div> : null}
            <label className="field">
              <span>Review note</span>
              <textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for the review team" />
            </label>
            <div className="modal-actions">
              <button className="portal-secondary" onClick={onClose}>Close</button>
              <button className="portal-primary" onClick={submitBuyReview} disabled={invalidOrder || submitting}>
                {submitting ? "Sending..." : "Send for review"}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-actions">
            <button className="portal-secondary" onClick={onClose}>Not now</button>
            <button className="portal-primary" onClick={onDeposit}>Deposit funds</button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function StockSellReviewModal({ stock, onClose, onSubmitted }) {
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!stock) return;
    setQuantity("1");
    setNote("");
    setError("");
  }, [stock?.symbol]);

  if (!stock) return null;

  const ownedShares = Number(stock.holding?.balance || 0);
  const price = Number(stock.price);
  const quantityNumber = Number(quantity);
  const estimatedTotal = Number.isFinite(price) && Number.isFinite(quantityNumber) && quantityNumber > 0 ? price * quantityNumber : 0;
  const exceedsHolding = quantityNumber > ownedShares;
  const invalidOrder = !ownedShares || !Number.isFinite(price) || price <= 0 || !quantityNumber || quantityNumber <= 0 || exceedsHolding;

  const submitSellReview = async () => {
    if (invalidOrder || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await createDashboardStockSellRequest({
        stock_symbol: stock.symbol,
        stock_name: stock.companyName || stock.name,
        quantity,
        estimated_price: String(price),
        estimated_total: String(estimatedTotal),
        note,
      });
      const order = response?.order || {};
      onSubmitted?.(`${stock.symbol} sell request sent for admin review. Estimated proceeds: ${order.estimated_total || formatCurrency(estimatedTotal)}.`);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to submit stock sell request."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Review stock sell" onClose={onClose}>
      <div className="stock-buy-modal">
        <AssetIcon asset={stock} size={42} />
        <div>
          <strong>{stock.symbol} sell request</strong>
          <p>Enter the shares to sell. Your assigned position stays unchanged until an administrator completes the review.</p>
        </div>
        <div className="stock-buy-form">
          {error && <div className="portal-inline-error">{error}</div>}
          <div className="field-grid">
            <label className="field">
              <span>Shares to sell</span>
              <input value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" placeholder="1" />
            </label>
            <div className="stock-owned-summary">
              <span>Owned shares</span>
              <strong>{formatNumber(ownedShares)} {stock.symbol}</strong>
            </div>
          </div>
          <div className="stock-buy-quote">
            <div><span>Market price</span><strong>{formatNullableCurrency(price)}</strong></div>
            <div><span>Estimated proceeds</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
            <div><span>Remaining after approval</span><strong>{formatNumber(Math.max(ownedShares - (quantityNumber || 0), 0))} shares</strong></div>
          </div>
          {exceedsHolding && <div className="field-error">Sell quantity exceeds your assigned stock holdings.</div>}
          <label className="field">
            <span>Review note</span>
            <textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for the review team" />
          </label>
          <div className="modal-actions">
            <button className="portal-secondary" onClick={onClose}>Close</button>
            <button className="portal-primary" onClick={submitSellReview} disabled={invalidOrder || submitting}>
              {submitting ? "Sending..." : "Send sell for review"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function StocksScreen({ assets = [], stockAssets = [], setActive }) {
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_STOCK_SYMBOLS[0]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("changePercent");
  const [range, setRange] = useState("1D");
  const [marketStatus, setMarketStatus] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [series, setSeries] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState("");
  const [buyStock, setBuyStock] = useState(null);
  const [buyNotice, setBuyNotice] = useState("");
  const [sellStock, setSellStock] = useState(null);
  const [detailStock, setDetailStock] = useState(null);
  const [compactLayout, setCompactLayout] = useState(false);
  const mountedRef = useRef(false);

  const fundingAssets = useMemo(
    () => assets.filter((asset) => ["USDC", "USDT"].includes(asset.symbol) && Number(asset.balance || 0) > 0),
    [assets],
  );
  const stockHoldingsBySymbol = useMemo(() => {
    return new Map(stockAssets.map((asset) => [asset.symbol, asset]));
  }, [stockAssets]);
  const displayStocks = useMemo(
    () => stocks.map((stock) => ({ ...stock, holding: stockHoldingsBySymbol.get(stock.symbol) || null })),
    [stockHoldingsBySymbol, stocks],
  );

  const loadStocks = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    try {
      const payload = await fetchStockBatch(DEFAULT_STOCK_SYMBOLS, { range: "1D", force });
      if (!mountedRef.current) return;
      setStocks(payload.stocks);
      setMarketStatus(payload.marketStatus || "");
      setUpdatedAt(payload.updatedAt);
      if (!payload.stocks.some((stock) => stock.symbol === selectedSymbol)) {
        setSelectedSymbol(payload.stocks[0]?.symbol || DEFAULT_STOCK_SYMBOLS[0]);
      }
    } catch (fetchError) {
      if (mountedRef.current) setUpdatedAt(new Date().toISOString());
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadStocks(false);
    const interval = window.setInterval(() => {
      if (!document.hidden) loadStocks(false);
    }, 60000);
    const resume = () => {
      if (!document.hidden) loadStocks(false);
    };
    const media = window.matchMedia("(max-width: 1320px)");
    const syncCompact = () => setCompactLayout(media.matches);
    syncCompact();
    media.addEventListener?.("change", syncCompact);
    document.addEventListener("visibilitychange", resume);
    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
      media.removeEventListener?.("change", syncCompact);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  useEffect(() => {
    if (!compactLayout) setDetailStock(null);
  }, [compactLayout]);

  const selected = useMemo(
    () => displayStocks.find((stock) => stock.symbol === selectedSymbol) || displayStocks[0] || null,
    [displayStocks, selectedSymbol],
  );

  useEffect(() => {
    if (!selected?.symbol) return undefined;
    let alive = true;
    setSeriesLoading(true);
    setSeriesError("");
    fetchStockTimeSeries(selected.symbol, range)
      .then((payload) => {
        if (alive) setSeries(payload.series);
      })
      .catch((fetchError) => {
        if (alive) {
          setSeries(selected.chart || []);
          setSeriesError("");
        }
      })
      .finally(() => {
        if (alive) setSeriesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selected?.symbol, range]);

  const summary = useMemo(() => {
    const working = displayStocks.length ? displayStocks : [];
    const sortedByChange = [...working].sort((a, b) => Number(b.changePercent) - Number(a.changePercent));
    const top = sortedByChange[0];
    const weakest = sortedByChange[sortedByChange.length - 1];
    const average = working.length
      ? working.reduce((total, stock) => total + (Number(stock.changePercent) || 0), 0) / working.length
      : 0;
    return { top, weakest, average };
  }, [displayStocks]);

  const filteredStocks = useMemo(() => {
    const search = query.trim().toLowerCase();
    const activeVolumes = [...displayStocks].map((stock) => Number(stock.volume) || 0).sort((a, b) => b - a);
    const activeCutoff = activeVolumes[Math.min(activeVolumes.length - 1, 9)] || 0;
    return displayStocks
      .filter((stock) => {
        const matchesSearch = !search || `${stock.symbol} ${stock.companyName}`.toLowerCase().includes(search);
        if (!matchesSearch) return false;
        if (filter === "Gainers") return Number(stock.changePercent) > 0;
        if (filter === "Losers") return Number(stock.changePercent) < 0;
        if (filter === "Most Active") return (Number(stock.volume) || 0) >= activeCutoff;
        return true;
      })
      .sort((a, b) => {
        if (sort === "symbol") return a.symbol.localeCompare(b.symbol);
        return (Number(b[sort]) || 0) - (Number(a[sort]) || 0);
      });
  }, [displayStocks, query, filter, sort]);

  const chooseStock = (stock) => {
    setSelectedSymbol(stock.symbol);
    if (compactLayout) setDetailStock(stock);
  };

  const onStockRowKeyDown = (event, stock) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseStock(stock);
    }
  };

  const visibleMarketStatus = ["Open", "Closed"].includes(marketStatus) ? marketStatus : "";

  return (
    <div className="screen-stack stocks-screen">
      <SectionHeader
        eyebrow="Public markets"
        title="Stocks"
        copy="Track major public market assets with live price movement, chart performance, and market activity."
        action={(
          <div className="stock-header-actions">
            {visibleMarketStatus && <span className={`stock-market-badge ${visibleMarketStatus.toLowerCase().replace(/\s+/g, "-")}`}>{visibleMarketStatus}</span>}
            <button className="portal-secondary" onClick={() => loadStocks(true)} disabled={refreshing} aria-label="Refresh stock market data">
              <LuRefreshCw className={refreshing ? "spin" : ""} /> Refresh
            </button>
          </div>
        )}
      />
      <div className="stock-market-meta">
        <span>Last updated: <strong>{formatMarketTime(updatedAt)}</strong></span>
      </div>
      {buyNotice && <div className="portal-inline-state">{buyNotice}</div>}

      <section className="stock-summary-grid" aria-label="Stock market summary">
        <StockSummaryCard label="Market Watchlist" value={loading ? "" : stocks.length} meta="Major stocks tracked" loading={loading} />
        <StockSummaryCard
          label="Top Performer"
          value={summary.top ? summary.top.symbol : "N/A"}
          meta={summary.top ? formatPercent(summary.top.changePercent) : "Awaiting data"}
          tone="up"
          loading={loading}
        />
        <StockSummaryCard
          label="Weakest Performer"
          value={summary.weakest ? summary.weakest.symbol : "N/A"}
          meta={summary.weakest ? formatPercent(summary.weakest.changePercent) : "Awaiting data"}
          tone="down"
          loading={loading}
        />
        <StockSummaryCard
          label="Average Movement"
          value={formatPercent(summary.average)}
          meta="Across tracked symbols"
          tone={summary.average >= 0 ? "up" : "down"}
          loading={loading}
        />
      </section>

      <section className="stock-dashboard-workspace">
        <div className="premium-panel stock-table-panel">
          <div className="stock-toolbar">
            <label className="portal-search stock-search">
              <LuSearch />
              <span className="sr-only">Search stocks</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company or symbol" />
            </label>
            <div className="stock-filter-group" aria-label="Stock filters">
              {stockFilterOptions.map((option) => (
                <button key={option} className={filter === option ? "active" : ""} onClick={() => setFilter(option)} aria-pressed={filter === option}>
                  {option}
                </button>
              ))}
            </div>
            <label className="stock-sort-control">
              <LuFilter />
              <span className="sr-only">Sort stocks</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort stocks">
                {stockSortOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="stock-table" role="table" aria-label="Top 20 stocks">
            <div className="stock-table-header" role="row">
              <span role="columnheader">Company</span>
              <span role="columnheader">Price</span>
              <span role="columnheader">Change</span>
              <span role="columnheader">Volume</span>
              <span role="columnheader">Trend</span>
              <span role="columnheader"><span className="sr-only">Trade</span></span>
            </div>
            {loading ? (
              <StockTableSkeleton />
            ) : filteredStocks.length ? (
              <div className="stock-table-body">
                {filteredStocks.map((stock) => {
                  const tone = stockTone(stock);
                  const positive = tone !== "down";
                  return (
                    <div
                      key={stock.symbol}
                      className={`stock-table-row ${selected?.symbol === stock.symbol ? "active" : ""}`}
                      onClick={() => chooseStock(stock)}
                      onKeyDown={(event) => onStockRowKeyDown(event, stock)}
                      tabIndex={0}
                      role="row"
                      aria-label={`Open ${stock.companyName} stock details`}
                    >
                      <span className="stock-company-cell" role="cell">
                        <AssetIcon asset={stock} size={38} />
                        <span>
                          <strong>{stock.companyName}</strong>
                          <small>
                            {stock.holding?.balance > 0
                              ? `${stock.symbol} - ${formatNumber(stock.holding.balance)} shares`
                              : stock.symbol}
                          </small>
                        </span>
                      </span>
                      <span data-label="Price" role="cell">{formatNullableCurrency(stock.price)}</span>
                      <span data-label="Change" role="cell" className={`stock-change ${tone}`}>{formatNullableCurrency(stock.change)}</span>
                      <span data-label="Volume" role="cell">{formatCompactNumber(stock.volume)}</span>
                      <span data-label="Trend" role="cell" className="stock-sparkline"><MiniLineChart data={stock.chart.map((point) => point.close)} positive={positive} label={`${stock.symbol} sparkline`} /></span>
                      <span role="cell" className="stock-buy-cell" aria-label={`Trade ${stock.symbol}`}>
                        <span className="stock-order-actions">
                        <button
                          className="stock-buy-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setBuyStock(stock);
                          }}
                        >
                          BUY
                        </button>
                        {Number(stock.holding?.balance || 0) > 0 && (
                          <button
                            className="stock-sell-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSellStock(stock);
                            }}
                          >
                            SELL
                          </button>
                        )}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No stocks found" copy="Try another symbol, company name or filter." />
            )}
          </div>
        </div>

        <StockDetailPanel stock={selected} range={range} setRange={setRange} series={series} loading={seriesLoading} error={seriesError} />
      </section>
      {detailStock && compactLayout && (
        <ModalShell title={`${detailStock.symbol} stock detail`} onClose={() => setDetailStock(null)}>
          <StockDetailPanel
            stock={detailStock}
            range={range}
            setRange={setRange}
            series={selected?.symbol === detailStock.symbol ? series : detailStock.chart}
            loading={selected?.symbol === detailStock.symbol ? seriesLoading : false}
            error={selected?.symbol === detailStock.symbol ? seriesError : ""}
            modal
          />
        </ModalShell>
      )}
      <StockBuyReviewModal
        stock={buyStock}
        fundingAssets={fundingAssets}
        onClose={() => setBuyStock(null)}
        onSubmitted={setBuyNotice}
        onDeposit={() => {
          setBuyStock(null);
          setActive?.("wallet");
        }}
      />
      <StockSellReviewModal
        stock={sellStock}
        onClose={() => setSellStock(null)}
        onSubmitted={setBuyNotice}
      />
    </div>
  );
}

function DocumentsScreen() {
  const { user } = useSession();
  const fileInputRef = useRef(null);
  const uploadCategories = ["KYC", "Wallet proof", "Exchange records", "Transaction evidence", "Legal authorization"];
  const [selectedCategory, setSelectedCategory] = useState(uploadCategories[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCase, setSelectedCase] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");
  const clientUploads = useDocumentUploads({ clientId: user?.id, role: "client" });
  const clientReports = useCaseReports({ clientId: user?.id, role: "client" });

  useEffect(() => {
    if (!selectedCase && clientReports[0]?.id) setSelectedCase(clientReports[0].id);
  }, [clientReports, selectedCase]);

  const chooseFile = (category) => {
    setSelectedCategory(category);
    fileInputRef.current?.click();
  };
  const onFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };
  const sendFile = async () => {
    try {
      await createDocumentUpload({ client: user, file: selectedFile, category: selectedCategory, caseId: selectedCase });
      setUploadNotice(`${selectedCategory} file sent to admin review.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadNotice(error.message || "Unable to send file.");
    }
  };

  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Secure documents" title="Evidence and verification vault" copy="Documents for claim review." />
      {uploadNotice && <div className="portal-inline-state">{uploadNotice}</div>}
      <section className="documents-layout">
        <div className="premium-panel upload-zone document-upload-card">
          <div className="upload-card-main">
            <span className="upload-icon-wrap"><LuUpload /></span>
            <div>
              <p>Select the document group, then attach the file for review.</p>
            </div>
          </div>
          <div className="document-upload-table" aria-label="Document upload controls">
            {uploadCategories.map((item) => (
              <div className="document-upload-row" key={item}>
                <span>Document type</span>
                <strong>{item}</strong>
                <button className={selectedCategory === item ? "active" : ""} onClick={() => chooseFile(item)} type="button"><LuUpload /> Upload file</button>
              </div>
            ))}
            <div className="document-upload-row summary">
              <span>Case</span>
              <strong>{selectedCase || "Unassigned"}</strong>
              <select value={selectedCase} onChange={(event) => setSelectedCase(event.target.value)}>
                <option value="">Unassigned document</option>
                {clientReports.map((report) => <option key={report.id} value={report.id}>{report.id} - {report.title}</option>)}
              </select>
            </div>
            <div className="document-upload-row summary">
              <span>File action</span>
              <strong>{selectedFile ? `${selectedCategory}: ${selectedFile.name}` : "No file selected"}</strong>
              <button className="portal-primary" type="button" onClick={sendFile} disabled={!selectedFile}><LuSend /> Send files</button>
            </div>
            <input ref={fileInputRef} type="file" hidden onChange={onFileSelected} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
          </div>
        </div>
      </section>
      <section className="premium-panel">
        <SectionHeader eyebrow="Uploaded documents" title="Verification status" />
        <div className="portal-table">
          {clientUploads.map((doc) => (
            <div className="portal-table-row" key={doc.id}>
              <LuFileText />
              <strong>{doc.documentName}</strong>
              <span>{doc.documentType}</span>
              <Badge s={doc.statusLabel} />
              <em>{new Date(doc.uploadedAt).toLocaleDateString()}</em>
              {doc.adminNote && <small className="muted">{doc.adminNote}</small>}
            </div>
          ))}
          {!clientUploads.length && <EmptyState title="No documents uploaded" copy="Uploaded documents and admin review status will appear here." />}
        </div>
      </section>
    </div>
  );
}

function SupportScreen() {
  const { user } = useSession();
  const { tickets, messagesByTicket, refresh, loading, error } = useTicketStore({ role: "client", clientId: user?.id });
  const [ticketOpen, setTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "General support", priority: "medium", message: "" });
  const [notice, setNotice] = useState("");
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);
  const selectedMessages = selectedTicket ? messagesByTicket[selectedTicket.id] || [] : [];
  const canCreateTicket = ticketForm.subject.trim() && ticketForm.message.trim();
  const submitTicket = async (event) => {
    event.preventDefault();
    if (!canCreateTicket) return;
    try {
      const ticket = await createSupportTicket({
        client: user,
        title: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        message: ticketForm.message,
      });
      setSelectedTicketId(ticket.id);
      setTicketForm({ subject: "", category: "General support", priority: "medium", message: "" });
      setTicketOpen(false);
      setNotice("Ticket created successfully.");
      await refresh();
    } catch (error) {
      setNotice(getErrorMessage(error, "Unable to create ticket."));
    }
  };
  const openTicket = async (ticket) => {
    setSelectedTicketId(ticket.id);
    try {
      await markTicketRead(ticket.id, "client", user?.id);
      await refresh();
    } catch {
      // Opening the conversation still works even if the read marker cannot be saved.
    }
  };

  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Support" title="Client service and case communication" />
      {notice && <div className="portal-inline-state">{notice}</div>}
      {error && <div className="portal-inline-error">{error}</div>}
      <section className="support-layout">
        <div className="premium-panel">
          <SectionHeader eyebrow="Tickets" title="Open requests" action={<button className="portal-primary" onClick={() => setTicketOpen((value) => !value)}><LuPlus /> Create ticket</button>} />
          {ticketOpen && (
            <form className="ticket-create-form" onSubmit={submitTicket}>
              <div className="field"><label>Ticket subject</label><input value={ticketForm.subject} onChange={(event) => setTicketForm({ ...ticketForm, subject: event.target.value })} placeholder="Short support request title" /></div>
              <div className="field-grid">
                <div className="field"><label>Category</label><select value={ticketForm.category} onChange={(event) => setTicketForm({ ...ticketForm, category: event.target.value })}><option>General support</option><option>Wallet support</option><option>Documents</option><option>Reports</option><option>Account access</option></select></div>
                <div className="field"><label>Priority</label><select value={ticketForm.priority} onChange={(event) => setTicketForm({ ...ticketForm, priority: event.target.value })}>{ticketPriorities.map((priority) => <option key={priority} value={priority}>{priorityLabels[priority]}</option>)}</select></div>
              </div>
              <div className="field"><label>Details</label><textarea rows="3" value={ticketForm.message} onChange={(event) => setTicketForm({ ...ticketForm, message: event.target.value })} placeholder="Describe what support should review." /></div>
              <div className="modal-actions">
                <button className="portal-secondary" type="button" onClick={() => setTicketOpen(false)}>Cancel</button>
                <button className="portal-primary" type="submit" disabled={!canCreateTicket}>Submit ticket</button>
              </div>
            </form>
          )}
          <div className="portal-table compact">
            {loading ? (
              <EmptyState title="Loading tickets" copy="Fetching your support conversations." />
            ) : tickets.length ? tickets.map((ticket) => (
              <div className="portal-table-row ticket-row" key={ticket.id}>
                <span className="mono">{ticket.id}</span>
                <div className="ticket-list-title"><strong>{ticket.title}</strong><TicketStatusBadge status={ticket.status} /></div>
                <span>{ticket.category}</span>
                {ticket.unreadForClient > 0 && <span className="ticket-unread">{ticket.unreadForClient}</span>}
                <button className="ticket-open-link" onClick={() => openTicket(ticket)}>Open chat <LuChevronRight /></button>
              </div>
            )) : <EmptyState title="No support tickets" copy="Create a ticket to start a support conversation." />}
          </div>
        </div>
        <ClientTicketDetail
          ticket={selectedTicket}
          messages={selectedMessages}
          user={user}
          onRefresh={refresh}
          onClose={() => setSelectedTicketId(null)}
        />
      </section>
    </div>
  );
}

function ClientTicketDetail({ ticket, messages, user, onClose, onRefresh }) {
  if (!ticket) {
    return (
      <aside className="premium-panel ticket-detail-panel">
        <EmptyState title="No ticket selected" copy="Open a ticket to view the support conversation." />
      </aside>
    );
  }
  return (
    <aside className="premium-panel ticket-detail-panel">
      <div className="ticket-detail-head">
        <div>
          <span className="portal-eyebrow">{ticket.id}</span>
          <div className="ticket-title-row">
            <h3>{ticket.title}</h3>
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>
        <button className="portal-icon-button" onClick={onClose} aria-label="Close ticket"><LuX /></button>
      </div>
      <div className="ticket-meta-table" aria-label="Ticket details">
        <div><span>Category</span><strong>{ticket.category}</strong></div>
        <div><span>Priority</span><strong><TicketPriorityBadge priority={ticket.priority} /></strong></div>
        <div><span>Created</span><strong>{formatTicketTime(ticket.createdAt)}</strong></div>
      </div>
      <TicketChatBox ticket={ticket} messages={messages} currentRole="client" sender={user} onRefresh={onRefresh} />
    </aside>
  );
}

function TicketChatBox({ ticket, messages, currentRole, sender, onRefresh }) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, ticket?.id]);

  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      setError("Enter a message before sending.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await sendTicketMessage({ ticketId: ticket.id, sender, senderRole: currentRole, message: draft });
      setDraft("");
      await onRefresh?.();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to send message."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ticket-chat-box">
      <div className="ticket-chat-thread">
        {messages.length ? messages.map((message) => (
          <TicketMessageBubble key={message.id} message={message} currentRole={currentRole} />
        )) : <EmptyState title="No messages yet" copy="The conversation will appear here." />}
        <div ref={scrollRef} />
      </div>
      {error && <small className="field-error">{error}</small>}
      <form className="ticket-chat-form" onSubmit={send}>
        <textarea rows="3" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a reply..." />
        <button className="portal-primary" type="submit" disabled={sending || !draft.trim()}><LuSend /> {sending ? "Sending" : "Send"}</button>
      </form>
    </div>
  );
}

function TicketMessageBubble({ message, currentRole }) {
  const mine = message.senderRole === currentRole;
  return (
    <div className={`ticket-message ${mine ? "mine" : "theirs"}`}>
      <div>
        <strong>{message.senderName}</strong>
        <small>{formatTicketTime(message.createdAt)}</small>
      </div>
      <p>{message.message}</p>
    </div>
  );
}

function TicketStatusBadge({ status }) {
  return <span className={`ticket-status ${status}`}>{statusLabels[status] || status}</span>;
}

function TicketPriorityBadge({ priority }) {
  return <span className={`ticket-priority ${priority}`}>{priorityLabels[priority] || priority}</span>;
}

function ReportsScreen() {
  const { user } = useSession();
  const clientReports = useCaseReports({ clientId: user?.id, role: "client" });
  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Reports" title="Recovery and investigation reports" copy="Exports and draft status." />
      <section className="premium-panel">
        <SectionHeader eyebrow="Report center" title="Available exports" />
        <div className="portal-table reports-export-table">
          {clientReports.map((report) => (
            <div className="portal-table-row report-export-row" key={report.id}>
              <div className="report-export-primary">
                <strong className="report-export-title">{report.title}</strong>
                <span className="mono report-export-id">RPT-{String(report.id).padStart(4, "0")}</span>
              </div>
              <div className="report-export-meta">
                <Badge s={report.statusLabel} />
                <span className="report-export-category">{report.category || "Case report"}</span>
                <em className="report-export-time">{formatTicketTime(report.updatedAt)}</em>
              </div>
              <button className="portal-secondary report-export-action" disabled={!report.documents?.length}><LuDownload /> Export</button>
            </div>
          ))}
          {!clientReports.length && <EmptyState title="No reports yet" copy="Case reports and admin-reviewed exports will appear here." />}
        </div>
      </section>
    </div>
  );
}

function NotificationsScreen() {
  const { user } = useSession();
  const clientReports = useCaseReports({ clientId: user?.id, role: "client" });
  const clientUploads = useDocumentUploads({ clientId: user?.id, role: "client" });
  const clientTransactions = useClientTransactions({ clientId: user?.id, role: "client" });
  const { tickets } = useTicketStore({ role: "client", clientId: user?.id });
  const notifications = useMemo(() => {
    const reportItems = clientReports.slice(0, 4).map((report) => ({
      key: `report-${report.id}`,
      title: report.title,
      type: "Case report",
      date: report.updatedAt,
      status: report.statusLabel,
    }));
    const documentItems = clientUploads.slice(0, 4).map((doc) => ({
      key: `document-${doc.id}`,
      title: doc.documentName,
      type: "Document",
      date: doc.uploadedAt,
      status: doc.statusLabel,
    }));
    const transactionItems = clientTransactions.slice(0, 4).map((tx) => ({
      key: `transaction-${tx.id}`,
      title: tx.transactionId,
      type: `${tx.typeLabel} - ${tx.displayAmount}`,
      date: tx.transactionDate || tx.updatedAt,
      status: tx.statusLabel,
    }));
    const ticketItems = tickets.slice(0, 4).map((ticket) => ({
      key: `ticket-${ticket.id}`,
      title: ticket.title,
      type: "Support request",
      date: ticket.updatedAt,
      status: statusLabels[ticket.status] || ticket.status,
    }));
    return [...reportItems, ...documentItems, ...transactionItems, ...ticketItems]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);
  }, [clientReports, clientTransactions, clientUploads, tickets]);

  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Notifications" title="Portal notifications" copy="Case, wallet, document, support, and security updates." />
      <section className="premium-panel">
        <SectionHeader eyebrow="Inbox" title="Recent notifications" />
        <div className="notification-list portal-notification-list">
          {notifications.map(({ key, title, type, date, status }) => (
            <div className="notification-item" key={key}>
              <div className="notification-copy">
                <strong>{title}</strong>
                <span>{type}</span>
              </div>
              <em>{formatTicketTime(date)}</em>
              <Badge s={status} />
            </div>
          ))}
          {!notifications.length && <EmptyState title="No notifications yet" copy="Backend activity will appear here once your account has cases, documents, transactions, or support messages." />}
        </div>
      </section>
    </div>
  );
}

const settingsCards = [
  { id: "profile", title: "Profile settings", copy: "Client and contact details.", icon: LuUserRound },
  { id: "security", title: "Security settings", copy: "Password, MFA, and sessions.", icon: LuKeyRound },
  { id: "kyc", title: "KYC and compliance", copy: "Identity and authorization status.", icon: LuShieldCheck },
  { id: "notifications", title: "Notifications", copy: "Email and portal alerts.", icon: LuBell },
];

function SettingsDetail({ type, user, onBack, changePassword, refreshCurrentUser, kycState, kycLocked }) {
  const profile = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  };
  const [security, setSecurity] = useState({ current: "", next: "", confirm: "" });
  const [securityNotice, setSecurityNotice] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [kycNotice, setKycNotice] = useState("");
  const [kycError, setKycError] = useState("");
  const [uploadingKyc, setUploadingKyc] = useState("");
  const [notifications, setNotifications] = useState({
    caseUpdates: localStorage.getItem("rp_notify_caseUpdates") !== "false",
    walletAlerts: localStorage.getItem("rp_notify_walletAlerts") !== "false",
    reportReady: localStorage.getItem("rp_notify_reportReady") !== "false",
    marketing: localStorage.getItem("rp_notify_marketing") === "true",
  });
  const [notificationNotice, setNotificationNotice] = useState("");
  const saveSecurity = async () => {
    setSecurityNotice("");
    setSecurityError("");
    if (!security.current || !security.next || security.next !== security.confirm) {
      setSecurityError("Enter your current password and matching new password.");
      return;
    }
    if (security.next.length < 10) {
      setSecurityError("New password must be at least 10 characters.");
      return;
    }
    setSavingSecurity(true);
    try {
      await changePassword?.({ currentPassword: security.current, newPassword: security.next });
      setSecurity({ current: "", next: "", confirm: "" });
      setSecurityNotice("Password updated.");
    } catch (error) {
      setSecurityError(getErrorMessage(error, "Unable to update password."));
    } finally {
      setSavingSecurity(false);
    }
  };
  const uploadKycDocument = async (documentType, file) => {
    if (!file || uploadingKyc) return;
    setUploadingKyc(documentType);
    setKycNotice("");
    setKycError("");
    try {
      await createDocumentUpload({ client: user, file, category: documentType });
      await refreshCurrentUser?.();
      setKycNotice(`${documentType} submitted for admin review.`);
    } catch (error) {
      setKycError(getErrorMessage(error, `Unable to upload ${documentType}.`));
    } finally {
      setUploadingKyc("");
    }
  };
  const saveNotifications = () => {
    Object.entries(notifications).forEach(([key, value]) => {
      localStorage.setItem(`rp_notify_${key}`, String(value));
    });
    setNotificationNotice("Notification preferences saved.");
  };

  if (type === "profile") {
    return (
      <section className="premium-panel settings-detail">
        <SectionHeader
          eyebrow="Profile settings"
          title="Client and contact details"
          action={<button className="portal-secondary" onClick={onBack}>Back</button>}
        />
        <div className="field-grid profile-locked-fields">
          <div className="field"><label>Full name</label><input value={profile.name} readOnly aria-readonly="true" /></div>
          <div className="field"><label>Email</label><input value={profile.email} readOnly aria-readonly="true" /></div>
          <div className="field"><label>Phone number</label><input value={profile.phone} readOnly aria-readonly="true" /></div>
          <div className="field"><label>Address</label><input value={profile.address} readOnly aria-readonly="true" /></div>
        </div>
        <div className="security-note"><LuLockKeyhole /> Onboarding profile details are locked for client editing.</div>
      </section>
    );
  }

  if (type === "security") {
    return (
      <section className="premium-panel settings-detail">
        <SectionHeader
          eyebrow="Security settings"
          title="Password, MFA, and sessions"
          action={<button className="portal-secondary" onClick={onBack}>Back</button>}
        />
        <div className="security-password-fields">
          <div className="field"><label>Current password</label><input type="password" value={security.current} onChange={(event) => setSecurity({ ...security, current: event.target.value })} /></div>
          <div className="field"><label>New password</label><input type="password" value={security.next} onChange={(event) => setSecurity({ ...security, next: event.target.value })} /></div>
          <div className="field"><label>Confirm new password</label><input type="password" value={security.confirm} onChange={(event) => setSecurity({ ...security, confirm: event.target.value })} /></div>
        </div>
        {securityNotice && <div className="auth-alert success">{securityNotice}</div>}
        {securityError && <small className="field-error">{securityError}</small>}
        <div className="modal-actions"><button className="portal-primary" onClick={saveSecurity} disabled={savingSecurity}>{savingSecurity ? "Updating..." : "Update security"}</button></div>
      </section>
    );
  }

  if (type === "kyc") {
    return (
      <section className="premium-panel settings-detail">
        <SectionHeader
          eyebrow="KYC and compliance"
          title="Identity and authorization status"
          copy="Upload each required compliance file. Admin approval unlocks the full client dashboard."
          action={!kycLocked && <button className="portal-secondary" onClick={onBack}>Back</button>}
        />
        {kycLocked && (
          <div className="security-note warning">
            <LuLockKeyhole />
            Complete KYC and wait for admin approval before using wallet, swap, reports, and case dashboard features.
          </div>
        )}
        <div className="kyc-progress-card">
          <IconTile tone={kycState?.approved ? "accent" : "warning"}><LuShieldCheck /></IconTile>
          <div>
            <span>Verification status</span>
            <strong>{kycState?.statusLabel || "Unverified"}</strong>
            <p>{kycState?.verifiedCount || 0} of {kycState?.requiredCount || 4} required documents approved.</p>
          </div>
        </div>
        {kycNotice && <div className="portal-inline-state">{kycNotice}</div>}
        {kycError && <div className="portal-inline-error">{kycError}</div>}
        <div className="kyc-document-grid">
          {(kycState?.items || []).map(({ type: documentType, document, statusLabel }) => {
            const inputId = `kyc-${documentType.replace(/\W+/g, "-").toLowerCase()}`;
            const busy = uploadingKyc === documentType;
            return (
              <article className="kyc-document-card" key={documentType}>
                <div>
                  <strong>{documentType}</strong>
                  <Badge s={statusLabel} />
                </div>
                <p>{document ? document.documentName : "No file submitted yet."}</p>
                {document?.adminNote && <small>{document.adminNote}</small>}
                <input
                  id={inputId}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadKycDocument(documentType, file);
                    event.target.value = "";
                  }}
                  hidden
                />
                <label className="portal-primary" htmlFor={inputId}>
                  <LuUpload /> {busy ? "Uploading..." : document ? "Replace file" : "Upload file"}
                </label>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="premium-panel settings-detail">
      <SectionHeader
        eyebrow="Notifications"
        title="Email and portal alerts"
        action={<button className="portal-secondary" onClick={onBack}>Back</button>}
      />
      <div className="settings-toggle-list">
        {[
          ["caseUpdates", "Case updates", "Progress, analyst notes, and required actions."],
          ["walletAlerts", "Wallet alerts", "Deposits, withdrawals, and address changes."],
          ["reportReady", "Report readiness", "Drafts, exports, and final reports."],
          ["marketing", "Recovery insights", "Occasional product and research updates."],
        ].map(([key, title, copy]) => (
          <label className="settings-toggle-row" key={key}>
            <span><strong>{title}</strong><small>{copy}</small></span>
            <input type="checkbox" checked={notifications[key]} onChange={(event) => setNotifications({ ...notifications, [key]: event.target.checked })} />
          </label>
        ))}
      </div>
      {notificationNotice && <div className="auth-alert success">{notificationNotice}</div>}
      <div className="modal-actions"><button className="portal-primary" onClick={saveNotifications}>Save preferences</button></div>
    </section>
  );
}

function SettingsScreen({ kycRequired = false, kycState }) {
  const { user, changePassword, refreshCurrentUser } = useSession();
  const [activeSetting, setActiveSetting] = useState(kycRequired ? "kyc" : null);

  useEffect(() => {
    if (kycRequired) setActiveSetting("kyc");
  }, [kycRequired]);

  if (activeSetting) {
    return (
      <div className="screen-stack">
        <SettingsDetail
          type={activeSetting}
          user={user}
          changePassword={changePassword}
          refreshCurrentUser={refreshCurrentUser}
          kycState={kycState}
          kycLocked={kycRequired}
          onBack={() => setActiveSetting(null)}
        />
      </div>
    );
  }

  return (
    <div className="screen-stack">
      <SectionHeader eyebrow="Settings" title="Account, security, and compliance preferences" copy="Profile, access, and wallet visibility." />
      {kycRequired && <div className="portal-inline-error">KYC approval is required before the rest of the dashboard unlocks.</div>}
      <section className="settings-grid">
        {settingsCards.map(({ id, title, copy, icon: Icon }) => (
          <div className="premium-panel settings-card" key={title}>
            <IconTile><Icon /></IconTile>
            <strong>{title}</strong>
            <p>{copy}</p>
            <button className="portal-secondary" onClick={() => setActiveSetting(id)}>Manage <LuChevronRight /></button>
          </div>
        ))}
      </section>
    </div>
  );
}

class DashboardScreenBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.screenKey !== this.props.screenKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="premium-panel">
          <EmptyState title="Unable to load this section" copy="Refresh the page or choose another dashboard section." />
        </section>
      );
    }
    return this.props.children;
  }
}

export function DashboardLayout() {
  const { go } = useApp();
  const { user } = useSession();
  const liveMarket = useLiveCryptoMarkets();
  const assignedAssets = useClientAssets({ clientId: user?.id, role: "client" });
  const clientUploads = useDocumentUploads({ clientId: user?.id, role: "client" });
  const [active, setActive] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedStockAsset, setSelectedStockAsset] = useState(null);
  const [depositAsset, setDepositAsset] = useState(null);
  const [withdrawAsset, setWithdrawAsset] = useState(null);

  const openAsset = (asset) => setSelectedAsset(asset);
  const openStockAsset = (asset) => setSelectedStockAsset(asset);
  const openDeposit = (asset) => {
    setSelectedAsset(null);
    setDepositAsset(asset);
  };
  const openWithdraw = (asset) => {
    setSelectedAsset(null);
    setWithdrawAsset(asset);
  };

  const dashboardAssets = useMemo(() => {
    const cryptoAssigned = assignedAssets.filter((asset) => asset.assetType !== "stock" && asset.type !== "stock");
    if (!cryptoAssigned.length) return [];
    return cryptoAssigned.map((assigned) => {
      const market = liveMarket.assets.find((asset) => asset.symbol === assigned.asset)
        || cryptoAssets.find((asset) => asset.symbol === assigned.asset)
        || cryptoAssets[0];
      const numericValue = Number(String(assigned.fiatValue).replace(/[^0-9.-]/g, ""));
      const numericAmount = Number(String(assigned.amount).replace(/[^0-9.-]/g, ""));
      return {
        ...market,
        id: assigned.id,
        type: "crypto",
        symbol: assigned.asset,
        name: assigned.assetName || market.name,
        coingeckoId: market.coingeckoId || market.cgId,
        chartSymbol: market.chartSymbol,
        balance: Number.isFinite(numericAmount) ? numericAmount : 0,
        value: Number.isFinite(numericValue) ? numericValue : 0,
        price: market.price || 0,
        change24h: market.change24h || 0,
        marketCap: market.marketCap || 0,
        volume24h: market.volume24h || 0,
        chartData: market.chartData || [],
        confirmations: market.confirmations || "Backend assigned",
        network: assigned.network || market.network,
        depositAddress: assigned.walletAddress || "No wallet assigned",
        memoOrTag: assigned.memoOrTag,
        visible: assigned.visible,
        adminAssigned: true,
      };
    });
  }, [assignedAssets, liveMarket.assets]);
  const dashboardStockAssets = useMemo(() => {
    return assignedAssets
      .filter((asset) => asset.assetType === "stock" || asset.type === "stock")
      .map((assigned) => {
        const meta = getStockAssetMeta(assigned.asset);
        const numericValue = Number(String(assigned.fiatValue).replace(/[^0-9.-]/g, ""));
        const numericAmount = Number(String(assigned.amount).replace(/[^0-9.-]/g, ""));
        return {
          ...meta,
          id: assigned.id,
          type: "stock",
          symbol: assigned.asset,
          name: assigned.assetName || meta.name,
          companyName: assigned.assetName || meta.name,
          balance: Number.isFinite(numericAmount) ? numericAmount : 0,
          value: Number.isFinite(numericValue) ? numericValue : 0,
          network: assigned.network || "US Equities",
          label: assigned.label || `${assigned.asset} position`,
          visible: assigned.visible,
          adminAssigned: true,
        };
      });
  }, [assignedAssets]);
  const kycState = useMemo(() => getKycState(user, clientUploads), [clientUploads, user]);
  const kycLocked = !kycState.approved;

  useEffect(() => {
    if (kycLocked && active !== "settings") {
      setActive("settings");
    }
  }, [active, kycLocked]);

  const stockFundingAssets = dashboardAssets.filter((asset) => ["USDC", "USDT"].includes(asset.symbol) && Number(asset.balance || 0) > 0);
  const screenProps = {
    assets: dashboardAssets,
    stockAssets: dashboardStockAssets,
    onSelect: openAsset,
    onSelectStock: openStockAsset,
    onDeposit: openDeposit,
    onWithdraw: openWithdraw,
    setActive,
  };
  const screens = {
    overview: <OverviewScreen {...screenProps} />,
    "report-case": <ReportCaseScreen />,
    wallet: <WalletScreen {...screenProps} />,
    stocks: <StocksScreen assets={dashboardAssets} stockAssets={dashboardStockAssets} setActive={setActive} />,
    transactions: <TransactionsScreen />,
    swap: <SwapScreen {...screenProps} />,
    markets: <MarketsScreen {...screenProps} marketAssets={liveMarket.assets} />,
    support: <SupportScreen />,
    reports: <ReportsScreen />,
    notifications: <NotificationsScreen />,
    settings: <SettingsScreen kycRequired={kycLocked} kycState={kycState} />,
  };

  const titles = {
    overview: "Overview",
    "report-case": "Report Case",
    wallet: "Wallet",
    stocks: "Stocks",
    transactions: "Transactions",
    swap: "Swap",
    markets: "Markets",
    support: "Support",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Settings",
  };

  const chooseSection = (section) => {
    setActive(kycLocked && section !== "settings" ? "settings" : section);
    setDrawerOpen(false);
  };

  return (
    <main className={`client-dashboard premium-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        active={active}
        setActive={chooseSection}
        mobileOpen={drawerOpen}
        kycLocked={kycLocked}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <section className="client-main">
        <header className="client-topbar premium-topbar">
          <button className="mobile-drawer-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
            <LuMenu />
          </button>
          <button className="client-mobile-logo" onClick={() => go("home")}>
            <LuShieldCheck /> RP
          </button>
          <div className="topbar-title">
            <h1>{titles[active]}</h1>
          </div>
          <div className="topbar-actions">
            <button className="portal-icon-button" aria-label="Notifications"><LuBell /></button>
            <UserMenu />
          </div>
        </header>
        <div className="client-body premium-body">
          <DashboardScreenBoundary screenKey={active}>{screens[active]}</DashboardScreenBoundary>
        </div>
      </section>
      {drawerOpen && <button className="portal-scrim" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />}
      <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} onDeposit={openDeposit} onWithdraw={openWithdraw} />
      <StockPositionDetailModal
        asset={selectedStockAsset}
        fundingAssets={stockFundingAssets}
        onClose={() => setSelectedStockAsset(null)}
        onDeposit={() => {
          setSelectedStockAsset(null);
          setActive("wallet");
        }}
      />
      <DepositModal asset={depositAsset} onClose={() => setDepositAsset(null)} />
      <WithdrawModal asset={withdrawAsset} onClose={() => setWithdrawAsset(null)} />
    </main>
  );
}
