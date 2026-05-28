import React from "react";
import { normalizeCryptoAsset } from "../../../lib/cryptoChartResolver.js";

export function CryptoAssetSelector({ assets = [], selectedSymbol, onSelect }) {
  const normalized = assets.map((asset) => normalizeCryptoAsset(asset));

  return (
    <div className="crypto-asset-selector" aria-label="Crypto asset selector">
      {normalized.map((asset) => (
        <button
          key={asset.symbol || asset.name}
          className={selectedSymbol === asset.symbol ? "active" : ""}
          onClick={() => onSelect?.(asset)}
        >
          <span>{asset.symbol.slice(0, 2)}</span>
          <strong>{asset.symbol}</strong>
          <small>{asset.name}</small>
        </button>
      ))}
    </div>
  );
}
