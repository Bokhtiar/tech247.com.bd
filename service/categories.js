import { connection } from "next/server";
import { apiGet } from "@/config/api";

export async function getCategories() {
  await connection();

  try {
    const body = await apiGet("categories");
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}

export async function getFeaturedCategories() {
  await connection();

  try {
    const body = await apiGet("categories?featured=1");
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}

export async function getPcBuilderCategories() {
  await connection();

  try {
    const body = await apiGet("categories?pc_builder=1");
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}
