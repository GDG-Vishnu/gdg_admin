import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "managed_events";

/**
 * GET /api/admin/managed-events — List all managed events
 */
export async function GET() {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    const events = snapshot.docs.map((doc) => ({
      eventId: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch managed events:", error);
    return NextResponse.json(
      { error: "Failed to fetch managed events" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/managed-events — Create a new managed event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = {
      title: body.title ?? "",
      description: body.description ?? "",
      bannerImage: body.bannerImage ?? "",
      posterImage: body.posterImage ?? "",
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      venue: body.venue ?? "",
      mode: body.mode ?? "OFFLINE",
      status: body.status ?? "DRAFT",
      eventType: body.eventType ?? "WORKSHOP",
      maxParticipants: body.maxParticipants ?? 0,
      registrationStart: body.registrationStart ?? null,
      registrationEnd: body.registrationEnd ?? null,
      isRegistrationOpen: body.isRegistrationOpen ?? false,
      createdBy: body.createdBy ?? "",
      tags: body.tags ?? [],
      keyHighlights: body.keyHighlights ?? [],
      eligibilityCriteria: body.eligibilityCriteria ? {
        yearOfGrad: body.eligibilityCriteria.yearOfGrad ?? [],
        Dept: Array.isArray(body.eligibilityCriteria.Dept)
          ? body.eligibilityCriteria.Dept.map((d: string) => d.replace(/&/g, ""))
          : [],
      } : {
        yearOfGrad: [],
        Dept: [],
      },
      executiveBoard: body.executiveBoard ?? {
        organiser: "",
        coOrganiser: "",
        facilitator: "",
      },
      eventOfficials: body.eventOfficials ?? [],
      faqs: body.faqs ?? [],
      rules: body.rules ?? [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!data.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    const docRef = await db.collection(COLLECTION).add(data);
    const created = await docRef.get();

    return NextResponse.json(
      { eventId: docRef.id, ...created.data() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create managed event:", error);
    return NextResponse.json(
      { error: "Failed to create managed event" },
      { status: 500 },
    );
  }
}
