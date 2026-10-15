import { connection } from "next/server";
import { apiGet } from "@/config/api";

const emptyMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  price_max: 0,
};

export async function getProductList(query = {}) {
  await connection();

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const path = params.size ? `products?${params}` : "products";

  try {
    const body = await apiGet(path);

    return {
      data: Array.isArray(body?.data) ? body.data : [],
      meta: { ...emptyMeta, ...(body?.meta ?? {}) },
    };
  } catch {
    return { data: [], meta: emptyMeta };
  }
}

export async function getProducts(query = {}) {
  const result = await getProductList(query);
  return result.data;
}

export async function getProduct(slug) {
  await connection();

  try {
    const body = await apiGet(`products/${encodeURIComponent(slug)}`);
    return body?.data ?? null;
  } catch {
    return null;
  }
}
