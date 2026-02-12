import { NextResponse } from "next/server";

export async function POST() {
  try {
    // In production, invalidate the session/token on the server
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 },
    );
  }
}
