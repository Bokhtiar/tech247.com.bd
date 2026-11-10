import { apiUrl } from "@/config/api";

export async function getCompareList({ groupId, ids = [] } = {}) {
  const params = new URLSearchParams();
  if (groupId) params.set("group_id", String(groupId));
  if (ids.length) params.set("ids", ids.join(","));

  const response = await fetch(apiUrl(`products/compare?${params}`), { cache: "no-store" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const first = body?.errors ? Object.values(body.errors).flat()[0] : "";
    const error = new Error(first || body.message || "Could not load comparison.");
    error.status = response.status;
    throw error;
  }

  return {
    data: Array.isArray(body?.data) ? body.data : [],
    meta: body?.meta || {},
    compareAttributes: Array.isArray(body?.compare_attributes) ? body.compare_attributes : [],
  };
}
