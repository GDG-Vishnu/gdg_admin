import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const snapshot = await db
      .collection("team_members")
      .orderBy("name", "asc")
      .get();

    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(members, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Failed to fetch team members:", err);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 },
    );
  }
}
