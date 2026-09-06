import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("icr_auth")?.value;

  // Protect /account and its sub-paths
  if (pathname.startsWith("/account")) {
    if (!authCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect away from login/register if already authenticated
  if ((pathname === "/login" || pathname === "/register") && authCookie) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/login", "/register"],
};
