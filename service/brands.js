import { connection } from "next/server";
import { apiGet } from "@/config/api";

export async function getBrands() {
  await connection();

  try {
    const body = await apiGet("brands");
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}
