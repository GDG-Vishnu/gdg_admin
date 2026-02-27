import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const AUTH_API_ROUTES = ["/api/auth/login", "/api/auth/logout", "/api/auth/me"];

// Public API routes that don't require authentication (read-only)
const PUBLIC_API_ROUTES = ["/api/events", "/api/forms"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (AUTH_API_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    if (
        PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route)) &&
        request.method === "GET"
    ) {
        return NextResponse.next();
    }

    // Allow public form response submission (POST)
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

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
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

    const payload = await verifyToken(token);

    if (!payload) {
        const response = isProtectedApi
            ? NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 },
            )
            : NextResponse.redirect(new URL("/", request.url));

        response.cookies.set(COOKIE_NAME, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });

        return response;
    }

    if (isProtectedRoute && !payload.isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Attach user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-name", payload.name);
    requestHeaders.set("x-user-is-admin", String(payload.isAdmin));

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

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
