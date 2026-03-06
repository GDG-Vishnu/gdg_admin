import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { computeEventStatus } from "@/lib/utils";

const COLLECTION = "managed_events";

/** Convert a Firestore Timestamp (or serialised {_seconds}) to an ISO string. */
function tsToISO(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if ("toDate" in (value as any) && typeof (value as any).toDate === "function") {
      return (value as any).toDate().toISOString();
    }
    const secs = (value as any)._seconds ?? (value as any).seconds;
    if (typeof secs === "number") return new Date(secs * 1000).toISOString();
  }
  return null;
}

/** Normalise all date fields on an event document to ISO strings. */
function normaliseDates(data: Record<string, any>): Record<string, any> {
  return {
    ...data,
    startDate: tsToISO(data.startDate),
    endDate: tsToISO(data.endDate),
    registrationStart: tsToISO(data.registrationStart),
    registrationEnd: tsToISO(data.registrationEnd),
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
  };
}

/**
 * GET /api/admin/managed-events/[id] — Get a single managed event
 * Auto-updates the event's status based on its start/end dates.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = doc.data()!;
    const computed = computeEventStatus(data.startDate, data.endDate);
    if (data.status !== computed) {
      await doc.ref.update({ status: computed, updatedAt: FieldValue.serverTimestamp() });
      data.status = computed;
    }

    return NextResponse.json({ eventId: doc.id, ...normaliseDates(data) });
  } catch (error) {
    console.error("Fetch managed event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/managed-events/[id] — Update a managed event
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "title",
      "description",
      "bannerImage",
      "posterImage",
      "startDate",
      "endDate",
      "venue",
      "mode",
      "status",
      "eventType",
      "maxParticipants",
      "registrationStart",
      "registrationEnd",
      "isRegistrationOpen",
      "tags",
      "keyHighlights",
      "Theme",
      "eligibilityCriteria",
      "executiveBoard",
      "eventOfficials",
      "faqs",
      "rules",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    // Strip & from department names
    if (data.eligibilityCriteria && typeof data.eligibilityCriteria === "object") {
      const ec = data.eligibilityCriteria as Record<string, unknown>;
      if (Array.isArray(ec.Dept)) {
        ec.Dept = ec.Dept.map((d: string) => d.replace(/&/g, ""));
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    data.updatedAt = FieldValue.serverTimestamp();

    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await docRef.update(data);
    const updated = await docRef.get();

    return NextResponse.json({ eventId: updated.id, ...normaliseDates(updated.data() as Record<string, any>) });
  } catch (error) {
    console.error("Update managed event error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/managed-events/[id] — Delete a managed event + its registrations
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete all registrations in the subcollection first
    const regsSnapshot = await docRef.collection("registrations").get();
    const batch = db.batch();
    regsSnapshot.docs.forEach((regDoc) => batch.delete(regDoc.ref));
    batch.delete(docRef);
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete managed event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
