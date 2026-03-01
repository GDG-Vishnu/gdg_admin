/**
 * POST /api/auth/logout
 * Clears the Firebase session cookie.
 */
import { NextResponse } from "next/server";
import { getLogoutCookieConfig } from "@/lib/auth";

export async function POST() {
  try {
    const cookieConfig = getLogoutCookieConfig();
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set(cookieConfig.name, cookieConfig.value, {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 },
    );
  }
}
