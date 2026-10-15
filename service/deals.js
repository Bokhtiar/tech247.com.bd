import { connection } from "next/server";
import { apiGet } from "@/config/api";

const emptyMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 4,
  total: 0,
};

export async function getDealList(query = {}) {
  await connection();

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  if (!params.has("per_page")) params.set("per_page", "4");

  try {
    const body = await apiGet(`deals?${params}`);

    return {
      data: Array.isArray(body?.data) ? body.data : [],
      meta: { ...emptyMeta, ...(body?.meta ?? {}) },
    };
  } catch {
    return { data: [], meta: emptyMeta };
  }
}
