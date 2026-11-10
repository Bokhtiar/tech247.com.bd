const DEFAULT_API_BASE_URL = "https://api.tech247.com.bd/api";

let runtimeApiBase = null;

function normalizeBase(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function readEnvApiBase() {
  return normalizeBase(
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
  );
}

/** Call from a client provider so browser code uses the server-resolved .env value. */
export function setRuntimeApiBase(url) {
  runtimeApiBase = normalizeBase(url) || null;
}

export function baseUrl() {
  const configured = runtimeApiBase || readEnvApiBase();

  // Public site must never keep calling a localhost API baked into an old build.
  if (typeof window !== "undefined") {
    try {
      const pageLocal = isLocalHostname(window.location.hostname);
      const apiHost = new URL(configured).hostname;
      if (!pageLocal && isLocalHostname(apiHost)) {
        return DEFAULT_API_BASE_URL;
      }
    } catch {
      return DEFAULT_API_BASE_URL;
    }
  }

  return configured || DEFAULT_API_BASE_URL;
}

/** Laravel origin used for /storage and /images (API base without trailing /api). */
export function mediaBaseUrl() {
  return baseUrl().replace(/\/api$/i, "");
}

/**
 * Resolve product/category image URLs against the configured backend.
 * Rewrites relative paths and accidental localhost storage URLs.
 */
export function resolveMediaUrl(src) {
  if (!src) return "";

  const media = mediaBaseUrl();

  if (src.startsWith("/")) {
    return `${media}${src}`;
  }

  try {
    const url = new URL(src);
    const mediaHost = new URL(media).hostname;
    if (isLocalHostname(url.hostname) && !isLocalHostname(mediaHost)) {
      return `${media}${url.pathname}${url.search}`;
    }
    return src;
  } catch {
    return src;
  }
}

export function apiUrl(path) {
  return `${baseUrl()}/${String(path).replace(/^\//, "")}`;
}

export async function apiGet(path) {
  const response = await fetch(apiUrl(path), { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }

  return response.json();
}

export function readXsrf() {
  if (typeof document === "undefined") return "";

  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function apiSend(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = readXsrf();
  if (token) headers["X-XSRF-TOKEN"] = token;

  const response = await fetch(apiUrl(path), {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || `API request failed: ${path}`);
    error.status = response.status;
    error.errors = payload.errors || {};
    throw error;
  }

  return payload;
}
