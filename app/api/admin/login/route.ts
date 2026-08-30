import { NextRequest, NextResponse } from "next/server";
import { cookieName, createAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const valid = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
  if (!valid) return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });

  const token = await createAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
