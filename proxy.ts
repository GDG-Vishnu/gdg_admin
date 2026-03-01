/**
 * Next.js Middleware — runs on every matched request before it reaches the
 * route handler. Performs lightweight session cookie checks for auth gating.
 *
 * Auth flow:
 *  1. Allow auth endpoints and public GETs through without a session.
 *  2. For protected routes, check if the Firebase session cookie exists.
 *  3. If cookie is present, forward the request (API routes do full verification).
 *  4. If cookie is missing, redirect (pages) or 401 (API).
 *
 * Note: Firebase Admin SDK cannot run in Edge Runtime, so we only check
 * cookie existence here. Full session verification happens in API routes.
 */
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "gdg_session";

const AUTH_API_ROUTES = ["/api/auth/login", "/api/auth/logout", "/api/auth/me"];

const PUBLIC_API_ROUTES = ["/api/events", "/api/forms"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth endpoints always pass through
  if (AUTH_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Public read-only APIs (events, forms) don't need auth
  if (
    PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route)) &&
    request.method === "GET"
  ) {
    return NextResponse.next();
  }

  // Allow unauthenticated users to submit form responses (public forms)
  if (
    pathname.match(/^\/api\/forms\/[^/]+\/responses$/) &&
    request.method === "POST"
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !AUTH_API_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  // Check for session cookie existence (lightweight, Edge-compatible)
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionCookie) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists — let the request through.
  // Full session verification is done by individual API routes.
  return NextResponse.next();
}

// Only run proxy on routes that need auth checks — skips static assets, _next, etc.
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/events/:path*",
    "/api/forms/:path*",
    "/api/upload/:path*",
    "/api/auth/login",
    "/api/auth/logout",
  ],
};
