import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("icr_auth")?.value;

  // Protected routes: account, orders, checkout
  const isProtected =
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/checkout");

  if (isProtected) {
    if (!authCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return res;
    }
  }

  // Redirect away from login/register if already authenticated (always default to root /)
  if ((pathname === "/login" || pathname === "/register") && authCookie) {
    const rawRedirect = request.nextUrl.searchParams.get("redirect") || "/";
    const targetPath = rawRedirect.startsWith("/login") || rawRedirect.startsWith("/register") ? "/" : rawRedirect;
    const res = NextResponse.redirect(new URL(targetPath, request.url));
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};

export default proxy;
