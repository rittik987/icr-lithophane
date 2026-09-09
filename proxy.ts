import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("icr_auth")?.value;

  // Protected routes: account, orders, cart, checkout, customize
  const isProtected =
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/customize");

  if (isProtected) {
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
  matcher: [
    "/account/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/customize/:path*",
    "/login",
    "/register",
  ],
};

export default proxy;
