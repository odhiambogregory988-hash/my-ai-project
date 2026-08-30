import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // OAuth callback is no longer used - redirect to admin page
  // The middleware will check for valid admin token
  return NextResponse.redirect(new URL("/admin", request.url));
}
