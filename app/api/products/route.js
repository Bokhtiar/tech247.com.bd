import { NextResponse } from "next/server";
import { getProductList } from "@/service/products";

export async function GET(request) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = await getProductList(query);

  return NextResponse.json(result);
}
