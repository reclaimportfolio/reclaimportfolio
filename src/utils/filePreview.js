function dataUrlToBlobUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  if (!match) return "";
  const mimeType = match[1] || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || "";
  const binary = isBase64 ? window.atob(payload) : decodeURIComponent(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

function withOpenableUrl(fileUrl, callback) {
  if (!fileUrl) return;
  const isDataUrl = String(fileUrl).startsWith("data:");
  const url = isDataUrl ? dataUrlToBlobUrl(fileUrl) : fileUrl;
  if (!url) return;
  callback(url);
  if (isDataUrl) window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function openFileUrl(fileUrl) {
  withOpenableUrl(fileUrl, (url) => {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    }
  });
}

export function downloadFileUrl(fileUrl, fileName = "document") {
  withOpenableUrl(fileUrl, (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "document";
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}
