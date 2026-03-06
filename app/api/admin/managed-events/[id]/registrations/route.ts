import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

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

/**
 * GET /api/admin/managed-events/[id]/registrations — List registrations for an event
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const eventDoc = await db.collection(COLLECTION).doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const snapshot = await db
      .collection(COLLECTION)
      .doc(id)
      .collection("registrations")
      .orderBy("registeredAt", "desc")
      .get();

    const registrations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        regId: doc.id,
        ...data,
        registeredAt: tsToISO(data.registeredAt),
        checkedInAt: tsToISO(data.checkedInAt),
      };
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/managed-events/[id]/registrations — Register a member
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const eventDoc = await db.collection(COLLECTION).doc(id).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = {
      userId: body.userId ?? "",
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      registrationType: body.registrationType ?? "Individual",
      registeredAt: FieldValue.serverTimestamp(),
      isCheckedIn: false,
      checkedInAt: null,
    };

    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const docRef = await db
      .collection(COLLECTION)
      .doc(id)
      .collection("registrations")
      .add(data);

    const created = await docRef.get();
    return NextResponse.json(
      { id: docRef.id, ...created.data() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to register member:", error);
    return NextResponse.json(
      { error: "Failed to register member" },
      { status: 500 },
    );
  }
}
