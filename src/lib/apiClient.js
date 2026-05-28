const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 12000;

const SESSION_KEYS = {
  client: "rp_client_session",
  admin: "rp_admin_session",
};
const refreshRequests = new Map();
const pendingGetRequests = new Map();

export class ApiError extends Error {
  constructor({ status = 0, message = "Request failed.", fields = {}, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.data = data;
  }
}

function apiUrl(path) {
  const cleanBase = String(RAW_API_BASE).replace(/\/+$/, "");
  const apiRoot = cleanBase ? (cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`) : "/api";
  const cleanPath = String(path || "").replace(/^\/+/, "").replace(/^api\//, "");
  const url = new URL(`${apiRoot}/${cleanPath}`, window.location.origin);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ApiError({ message: "The configured API URL is invalid." });
  }
  if (window.location.protocol === "https:" && url.protocol !== "https:") {
    throw new ApiError({ message: "Secure pages must use an HTTPS API endpoint." });
  }
  return url.toString();
}

function storageKey(scope = "client") {
  return SESSION_KEYS[scope] || SESSION_KEYS.client;
}

export function getStoredSession(scope = "client") {
  const key = storageKey(scope);
  try {
    const current = sessionStorage.getItem(key);
    if (current) return JSON.parse(current);
    const legacy = localStorage.getItem(key);
    if (!legacy) return null;
    sessionStorage.setItem(key, legacy);
    localStorage.removeItem(key);
    return JSON.parse(legacy);
  } catch {
    return null;
  }
}

export function storeStoredSession(session, scope = "client") {
  const key = storageKey(scope);
  try {
    localStorage.removeItem(key);
    if (session) sessionStorage.setItem(key, JSON.stringify(session));
    else sessionStorage.removeItem(key);
  } catch {
    // Storage may be blocked; the React session remains available until reload.
  }
}

function fieldErrorsFrom(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (["detail", "message"].includes(key)) return acc;
    acc[key] = Array.isArray(value) ? value.join(" ") : String(value);
    return acc;
  }, {});
}

function messageFrom(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail.join(" ") : String(data.detail);
  if (data.message) return Array.isArray(data.message) ? data.message.join(" ") : String(data.message);
  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(" ") : String(data.non_field_errors);
  }
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first.join(" ");
  if (first) return String(first);
  return fallback;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (response.ok) return data;
  const fields = fieldErrorsFrom(data);
  throw new ApiError({
    status: response.status,
    message: messageFrom(data, response.statusText || "Request failed."),
    fields,
    data,
  });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: options.signal || controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError({ status: 408, message: "The request timed out. Please try again." });
    }
    throw new ApiError({ message: "Unable to connect to the service. Please try again." });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function refreshToken(scope) {
  if (refreshRequests.has(scope)) return refreshRequests.get(scope);
  const request = (async () => {
    const session = getStoredSession(scope);
    if (!session?.refresh) return null;
    const response = await fetchWithTimeout(apiUrl("auth/token/refresh/"), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: session.refresh }),
    });
    if (!response.ok) return null;
    const refreshed = await parseResponse(response);
    if (!refreshed?.access) return null;
    const nextSession = {
      ...session,
      access: refreshed.access,
      refresh: refreshed.refresh || session.refresh,
    };
    storeStoredSession(nextSession, scope);
    return nextSession;
  })();
  refreshRequests.set(scope, request);
  try {
    return await request;
  } finally {
    refreshRequests.delete(scope);
  }
}

export async function apiRequest(path, { method = "GET", body = null, auth = false, scope = "client", retry = true, timeoutMs = API_TIMEOUT_MS } = {}) {
  const session = getStoredSession(scope);
  const isFormData = body instanceof FormData;
  const headers = { Accept: "application/json" };
  if (body != null && !isFormData) headers["Content-Type"] = "application/json";
  if (auth && session?.access) headers.Authorization = `Bearer ${session.access}`;

  const fullUrl = apiUrl(path);
  const requestKey = method === "GET" && retry ? `${scope}:${auth ? "auth" : "public"}:${fullUrl}` : "";
  if (requestKey && pendingGetRequests.has(requestKey)) return pendingGetRequests.get(requestKey);

  const execute = async () => {
    const response = await fetchWithTimeout(fullUrl, {
      method,
      headers,
      body: body == null ? null : isFormData ? body : JSON.stringify(body),
    }, timeoutMs);

    if (response.status === 401 && auth && retry) {
      const refreshed = await refreshToken(scope);
      if (refreshed?.access) {
        return apiRequest(path, { method, body, auth, scope, retry: false, timeoutMs });
      }
      storeStoredSession(null, scope);
    }

    return parseResponse(response);
  };

  const request = execute();
  if (requestKey) pendingGetRequests.set(requestKey, request);
  try {
    return await request;
  } finally {
    if (requestKey) pendingGetRequests.delete(requestKey);
  }
}

export const getSession = () => getStoredSession("client");
export const storeSession = (session) => storeStoredSession(session, "client");
export const getAdminSession = () => getStoredSession("admin");
export const storeAdminSession = (session) => storeStoredSession(session, "admin");
