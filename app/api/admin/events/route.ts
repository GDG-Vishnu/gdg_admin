import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { normalizeEventData } from "@/lib/normalize";

export async function GET() {
  try {
    const snapshot = await db
      .collection("events")
      .orderBy("Date", "desc")
      .get();

    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      return normalizeEventData({ ...data, id: doc.id });
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
