import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../../../context.js";
import { normalizeCryptoAsset, resolveCryptoChart } from "../../../lib/cryptoChartResolver.js";
import { fetchCoinGeckoChart, fetchCoinGeckoPrice } from "../../../services/cryptoChartService.js";
import { CryptoChartShell, CryptoChartSkeleton, CryptoChartState } from "./CryptoChartShell.jsx";

let tradingViewScriptPromise = null;

function loadTradingViewScript() {
  if (window.TradingView) return Promise.resolve(window.TradingView);
  if (tradingViewScriptPromise) return tradingViewScriptPromise;

  tradingViewScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("tradingview-widget-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.TradingView), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.onload = () => resolve(window.TradingView);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return tradingViewScriptPromise;
}

function TradingViewChart({ symbol, theme, timeframe, height, onError }) {
  const containerRef = useRef(null);
  const containerId = useMemo(() => `tradingview-${Math.random().toString(36).slice(2)}`, []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) onError?.();
    }, 3200);
    setLoading(true);
    if (containerRef.current) containerRef.current.innerHTML = "";

    loadTradingViewScript()
      .then(() => {
        if (cancelled || !window.TradingView || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        const child = document.createElement("div");
        child.id = containerId;
        child.className = "tradingview-widget-container__widget";
        child.style.height = "100%";
        child.style.width = "100%";
        containerRef.current.appendChild(child);

        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval: timeframe === "1D" ? "15" : "60",
          timezone: "Etc/UTC",
          theme: theme === "light" ? "light" : "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          calendar: false,
          support_host: "https://www.tradingview.com",
          container_id: containerId,
        });
        window.setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, 1200);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          onError?.();
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [containerId, onError, symbol, theme, timeframe]);

  return (
    <div className="crypto-chart-frame tradingview" style={{ height }}>
      {loading && <CryptoChartSkeleton height={height} />}
      <div ref={containerRef} className="crypto-chart-widget-host" />
    </div>
  );
}

function GeckoTerminalChart({ asset, theme, height }) {
  const chartPath = asset.pairAddress
    ? `pools/${encodeURIComponent(asset.pairAddress)}`
    : asset.contractAddress
      ? `tokens/${encodeURIComponent(asset.contractAddress)}`
      : "";

  if (!asset.chain || !chartPath) {
    return (
      <CryptoChartState
        type="empty"
        title="No supported chart source was found for this asset yet."
        copy="A DEX chart needs a chain and pool or token address."
      />
    );
  }

  const src = `https://www.geckoterminal.com/${encodeURIComponent(asset.chain)}/${chartPath}?embed=1&info=0&swaps=0&grayscale=0&light_chart=${theme === "light" ? 1 : 0}`;

  return (
    <div className="crypto-chart-frame geckoterminal" style={{ height }}>
      <iframe
        title={`${asset.name} GeckoTerminal chart`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  return (
    <div className="crypto-chart-tooltip">
      <strong>{formatUsd(point.price)}</strong>
      <span>{formatChartTime(label)}</span>
    </div>
  );
}

function formatUsd(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: number > 10 ? 2 : 6,
  }).format(number);
}

function formatChartTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric" }).format(date);
}

function localSeriesFromAsset(asset = {}) {
  const chartData = Array.isArray(asset.chartData) ? asset.chartData.map(Number).filter(Number.isFinite) : [];
  if (!chartData.length) return [];
  const last = chartData[chartData.length - 1] || 1;
  const price = Number(asset.price) || last || 1;
  const now = Date.now();
  const step = 60 * 60 * 1000;

  return chartData.map((value, index) => ({
    time: new Date(now - (chartData.length - 1 - index) * step).toISOString(),
    price: Number((price * (value / last)).toFixed(price > 10 ? 2 : 6)),
    volume: Number(asset.volume24h || 0) / Math.max(chartData.length, 1),
  }));
}

function CoinGeckoChartFallback({ asset, timeframe, height, refreshKey, onPrice }) {
  const localSeries = useMemo(() => localSeriesFromAsset(asset), [asset]);
  const [state, setState] = useState({
    loading: !localSeries.length,
    error: "",
    series: localSeries,
    price: asset.price,
    change24h: asset.change24h,
  });

  useEffect(() => {
    let alive = true;
    const fallbackSeries = localSeriesFromAsset(asset);
    async function loadFallback() {
      if (!asset.coingeckoId) {
        setState({
          loading: false,
          error: fallbackSeries.length ? "" : "missing-id",
          series: fallbackSeries,
          price: asset.price,
          change24h: asset.change24h,
        });
        return;
      }
      setState((current) => ({
        ...current,
        loading: !current.series.length && !fallbackSeries.length,
        error: "",
        series: current.series.length ? current.series : fallbackSeries,
        price: current.price ?? asset.price,
        change24h: current.change24h ?? asset.change24h,
      }));
      try {
        const [chart, price] = await Promise.all([
          fetchCoinGeckoChart(asset.coingeckoId, timeframe, Boolean(refreshKey)),
          fetchCoinGeckoPrice(asset.coingeckoId, Boolean(refreshKey)),
        ]);
        if (!alive) return;
        const nextSeries = chart.series?.length ? chart.series : fallbackSeries;
        setState({
          loading: false,
          error: nextSeries.length ? "" : "failed",
          series: nextSeries,
          price: Number.isFinite(price.price) ? price.price : asset.price,
          change24h: Number.isFinite(price.change24h) ? price.change24h : asset.change24h,
        });
        onPrice?.(price);
      } catch {
        if (alive) {
          setState({
            loading: false,
            error: fallbackSeries.length ? "" : "failed",
            series: fallbackSeries,
            price: asset.price,
            change24h: asset.change24h,
          });
        }
      }
    }
    loadFallback();
    return () => {
      alive = false;
    };
  }, [asset, asset.coingeckoId, asset.price, asset.change24h, timeframe, refreshKey, onPrice]);

  if (state.loading) return <CryptoChartSkeleton height={height} />;
  if (state.error || !state.series.length) {
    return (
      <CryptoChartState
        type="error"
        title="Chart data is temporarily unavailable for this asset."
        copy="Try fallback chart"
      />
    );
  }

  const positive = Number(state.change24h ?? asset.change24h) >= 0;
  const stroke = positive ? "var(--accent-2)" : "#E0826B";

  return (
    <div className="crypto-chart-frame coingecko" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={state.series} margin={{ top: 18, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`coinGeckoArea-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-soft)" vertical={false} />
          <XAxis dataKey="time" tickFormatter={formatChartTime} tickLine={false} axisLine={false} minTickGap={30} stroke="var(--muted)" fontSize={11} />
          <YAxis orientation="right" tickFormatter={formatUsd} tickLine={false} axisLine={false} width={76} stroke="var(--muted)" fontSize={11} domain={["dataMin", "dataMax"]} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={2.5} fill={`url(#coinGeckoArea-${asset.symbol})`} dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CryptoChartDisplay({
  asset: rawAsset,
  height = 420,
  theme,
  defaultProvider = "auto",
  showHeader = true,
  showControls = true,
  onProviderChange,
}) {
  const app = useApp();
  const activeTheme = theme || app.theme || "dark";
  const [timeframe, setTimeframe] = useState("7D");
  const [providerOverride, setProviderOverride] = useState(defaultProvider === "auto" ? "" : defaultProvider);
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartError, setChartError] = useState(false);
  const [priceData, setPriceData] = useState(null);

  const resolved = useMemo(() => resolveCryptoChart(rawAsset || {}), [rawAsset]);
  const asset = useMemo(() => normalizeCryptoAsset({ ...resolved.asset, ...rawAsset }), [rawAsset, resolved.asset]);
  const automaticProvider = resolved.provider === "tradingview" && asset.coingeckoId ? "coingecko" : resolved.provider;
  const provider = providerOverride || automaticProvider;
  const canFallback = resolved.fallbackProvider && resolved.fallbackProvider !== "none" && provider !== resolved.fallbackProvider;
  const displayPrice = priceData?.price ?? asset.price;
  const displayChange = priceData?.change24h ?? asset.change24h;
  const handleChartError = useCallback(() => setChartError(true), []);

  useEffect(() => {
    setChartError(false);
    setProviderOverride(defaultProvider === "auto" ? "" : defaultProvider);
  }, [defaultProvider, resolved.symbol]);

  const changeProvider = (nextProvider) => {
    setProviderOverride(nextProvider);
    setChartError(false);
    onProviderChange?.(nextProvider);
  };

  const fallbackButton = canFallback ? (
    <button className="portal-secondary" onClick={() => changeProvider(resolved.fallbackProvider)}>
      Try fallback chart
    </button>
  ) : null;

  let content = null;
  if (provider === "tradingview" && !chartError) {
    content = <TradingViewChart symbol={resolved.symbol} theme={activeTheme} timeframe={timeframe} height={height} onError={handleChartError} />;
  } else if (provider === "geckoterminal" && !chartError) {
    content = <GeckoTerminalChart asset={asset} theme={activeTheme} height={height} />;
  } else if (provider === "coingecko" || chartError) {
    content = (
      <CoinGeckoChartFallback
        asset={asset}
        timeframe={timeframe}
        height={height}
        refreshKey={refreshKey}
        onPrice={setPriceData}
      />
    );
  } else {
    content = (
      <CryptoChartState
        type="empty"
        title="No supported chart source was found for this asset yet."
        copy={resolved.reason}
      />
    );
  }

  return (
    <CryptoChartShell
      asset={asset}
      provider={chartError && provider !== "coingecko" ? "coingecko" : provider}
      title={resolved.title}
      price={displayPrice}
      change24h={displayChange}
      height={height}
      showHeader={showHeader}
      showControls={showControls}
      timeframe={timeframe}
      onTimeframeChange={setTimeframe}
      onRefresh={() => setRefreshKey((value) => value + 1)}
    >
      {chartError && !asset.coingeckoId ? (
        <CryptoChartState
          type="error"
          title="Chart data is temporarily unavailable for this asset."
          copy="No fallback source is configured for this asset."
          action={fallbackButton}
        />
      ) : (
        content
      )}
      {chartError && asset.coingeckoId && fallbackButton ? <div className="crypto-chart-fallback-action">{fallbackButton}</div> : null}
    </CryptoChartShell>
  );
}
