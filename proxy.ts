import { NextResponse, type NextRequest } from "next/server";
import { isAdminTokenValid, cookieName } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/admin/callback" ||
    request.nextUrl.pathname === "/admin/reset-password"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(cookieName)?.value;
  const isValid = await isAdminTokenValid(token);

  if (!isValid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

