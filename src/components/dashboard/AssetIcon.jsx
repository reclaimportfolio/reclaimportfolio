import React, { useEffect, useMemo, useState } from "react";
import { getAssetIcon } from "../../lib/assetIconResolver.js";

export function AssetIcon({ asset, size = 36, className = "" }) {
  const [failedUrl, setFailedUrl] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const resolved = useMemo(() => getAssetIcon(asset), [asset]);
  
  const iconUrl = useMemo(() => {
    if (useFallback && resolved.fallbackUrl) {
      return resolved.fallbackUrl !== failedUrl ? resolved.fallbackUrl : "";
    }
    return resolved.iconUrl && resolved.iconUrl !== failedUrl ? resolved.iconUrl : "";
  }, [resolved.iconUrl, resolved.fallbackUrl, failedUrl, useFallback]);

  useEffect(() => {
    setFailedUrl("");
    setUseFallback(false);
  }, [resolved.iconUrl]);

  const onError = () => {
    if (import.meta.env.DEV && iconUrl) {
      console.warn(`[AssetIcon] Failed to load ${asset?.symbol || asset?.name || "asset"} icon from ${iconUrl}`);
    }
    
    setFailedUrl(iconUrl);
    
    // Try fallback URL if primary fails and we haven't tried fallback yet
    if (!useFallback && resolved.fallbackUrl && iconUrl !== resolved.fallbackUrl) {
      setUseFallback(true);
    }
  };

  return (
    <span
      className={`asset-icon ${className}`}
      style={{ "--asset-icon-size": `${size}px` }}
      aria-label={`${asset?.name || asset?.symbol || "Asset"} icon`}
    >
      {iconUrl ? (
        <img src={iconUrl} alt="" loading="lazy" referrerPolicy="no-referrer" onError={onError} />
      ) : (
        <span className="asset-icon-fallback">{resolved.fallback}</span>
      )}
    </span>
  );
}
