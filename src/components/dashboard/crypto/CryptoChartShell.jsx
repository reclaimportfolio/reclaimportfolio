import React from "react";
import { LuChartLine, LuCircleAlert, LuRefreshCw } from "react-icons/lu";
import { AssetIcon } from "../AssetIcon.jsx";

const providerLabels = {
  tradingview: "TradingView",
  geckoterminal: "GeckoTerminal",
  coingecko: "CoinGecko",
  custom: "Custom",
  none: "No source",
};

export function CryptoChartSkeleton({ height = 420 }) {
  return (
    <div className="crypto-chart-loading" style={{ minHeight: height }} aria-label="Loading crypto chart">
      <span className="crypto-chart-skeleton-line short" />
      <span className="crypto-chart-skeleton-graph" />
    </div>
  );
}

export function CryptoChartState({ type = "empty", title, copy, action }) {
  const Icon = type === "error" ? LuCircleAlert : LuChartLine;
  return (
    <div className={`crypto-chart-state ${type}`}>
      <Icon />
      <strong>{title}</strong>
      {copy && <span>{copy}</span>}
      {action}
    </div>
  );
}

export function CryptoChartShell({
  asset,
  provider,
  title,
  price,
  change24h,
  height = 420,
  showHeader = true,
  showControls = true,
  timeframe,
  onTimeframeChange,
  onRefresh,
  refreshing = false,
  children,
}) {
  const positive = Number(change24h) >= 0;
  const displayPrice = Number.isFinite(Number(price))
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Number(price) > 10 ? 2 : 6 }).format(Number(price))
    : "";
  const displayChange = Number.isFinite(Number(change24h)) ? `${positive ? "+" : ""}${Number(change24h).toFixed(2)}%` : "";
  const ranges = ["1D", "7D", "1M", "3M", "1Y"];

  return (
    <section className="crypto-chart-shell" style={{ "--crypto-chart-height": `${height}px` }}>
      {showHeader && (
        <div className="crypto-chart-head">
          <div className="crypto-chart-identity">
            <AssetIcon asset={asset} size={38} />
            <div>
              <small>{asset?.symbol || "Asset"}</small>
              <strong>{title || asset?.name || "Crypto chart"}</strong>
            </div>
          </div>
          <div className="crypto-chart-meta">
            <em>{providerLabels[provider] || providerLabels.none}</em>
            {displayPrice && <strong>{displayPrice}</strong>}
            {displayChange && <span className={positive ? "is-up" : "is-down"}>{displayChange}</span>}
          </div>
        </div>
      )}
      {showControls && (
        <div className="crypto-chart-controls">
          <div aria-label="Chart timeframe">
            {ranges.map((range) => (
              <button key={range} className={timeframe === range ? "active" : ""} onClick={() => onTimeframeChange?.(range)} aria-pressed={timeframe === range}>
                {range}
              </button>
            ))}
          </div>
          {onRefresh && (
            <button className="crypto-chart-refresh" onClick={onRefresh} aria-label="Refresh chart">
              <LuRefreshCw className={refreshing ? "spin" : ""} />
            </button>
          )}
        </div>
      )}
      <div className="crypto-chart-body" style={{ minHeight: height }}>
        {children}
      </div>
    </section>
  );
}
