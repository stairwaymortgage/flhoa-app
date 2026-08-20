import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json(await search(q));
}
