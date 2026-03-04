import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "managed_events";

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

    const registrations = snapshot.docs.map((doc) => ({
      regId: doc.id,
      ...doc.data(),
    }));

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
