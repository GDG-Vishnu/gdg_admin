import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 },
            );
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 },
            );
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: payload.userId,
                email: payload.email,
                name: payload.name,
                role: payload.isAdmin ? "admin" : "user",
            },
        });
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500 },
        );
    }
}
