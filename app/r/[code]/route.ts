import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const cleanCode = (code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  const targetUrl = new URL("/", request.url);
  if (cleanCode) {
    targetUrl.searchParams.set("ref", cleanCode);
  }

  const response = NextResponse.redirect(targetUrl);

  if (cleanCode) {
    response.cookies.set("icr_ref", cleanCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
