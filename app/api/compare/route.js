import { NextResponse } from "next/server";
import { getCompareList } from "@/service/compare";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("group_id");
  const ids = String(searchParams.get("ids") || "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter(Boolean);

  try {
    const result = await getCompareList({ groupId, ids });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Could not load compare data.", data: [], compareAttributes: [], meta: {} },
      { status: error.status || 500 },
    );
  }
}
