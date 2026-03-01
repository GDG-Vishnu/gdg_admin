import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

// ISR revalidation — Next.js will cache this response for 1 hour in production
export const revalidate = 3600;

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

    // Cache at CDN/browser level: fresh for 1hr, serve stale for up to 24hr while revalidating
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
