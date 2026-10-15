import { NextResponse } from "next/server";
import { getDealList } from "@/service/deals";

export async function GET(request) {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = await getDealList(query);

  return NextResponse.json(result);
}
