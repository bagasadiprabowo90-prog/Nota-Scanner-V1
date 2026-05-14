import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_EMAIL_DOMAIN, isAllowedEmail } from "@/lib/auth";

const AUTH_PASSWORD = "Blp123";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const remember = Boolean(body?.remember);

  if (!isAllowedEmail(email)) {
    return NextResponse.json(
      { message: `Gunakan email kantor dengan domain ${AUTH_EMAIL_DOMAIN}.` },
      { status: 400 },
    );
  }

  if (password !== AUTH_PASSWORD) {
    return NextResponse.json(
      { message: "Password belum sesuai." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE,
    value: encodeURIComponent(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });

  return response;
}
