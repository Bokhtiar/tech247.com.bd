const DEFAULT_API_BASE_URL = "https://admin.tech247.com.bd/api";

export function baseUrl() {
  const value = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

  return value.replace(/\/$/, "");
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
