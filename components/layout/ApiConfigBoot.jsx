"use client";

import { setRuntimeApiBase } from "@/config/api";

/** Sync .env-resolved API base into client module before any child effects/fetches. */
export default function ApiConfigBoot({ apiBaseUrl, children }) {
  setRuntimeApiBase(apiBaseUrl);
  return children;
}
