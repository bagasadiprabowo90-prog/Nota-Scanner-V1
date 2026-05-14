import { NextRequest, NextResponse } from "next/server";

const GSHEET_URL = process.env.NEXT_PUBLIC_GSHEET_URL || "";

export async function GET() {
  if (!GSHEET_URL) {
    return NextResponse.json({ success: false, transactions: [] });
  }
  try {
    const res = await fetch(`${GSHEET_URL}?action=getAll`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, transactions: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!GSHEET_URL) {
    return NextResponse.json({ success: false, error: "No GSHEET_URL configured" });
  }
  try {
    const body = await req.text();
    const res = await fetch(GSHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      redirect: "follow",
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid response from GSheet" });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to reach GSheet" });
  }
}
