import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "managed_events";

/**
 * PATCH /api/admin/managed-events/[id]/registrations/[regId] — Update a registration (e.g. check-in)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> },
) {
  try {
    const { id, regId } = await params;
    const body = await request.json();

    const regRef = db
      .collection(COLLECTION)
      .doc(id)
      .collection("registrations")
      .doc(regId);

    const regDoc = await regRef.get();
    if (!regDoc.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    const data: Record<string, unknown> = {};

    if ("isCheckedIn" in body) {
      data.isCheckedIn = body.isCheckedIn;
      data.checkedInAt = body.isCheckedIn
        ? FieldValue.serverTimestamp()
        : null;
    }
    if ("registrationType" in body) {
      data.registrationType = body.registrationType;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    await regRef.update(data);
    const updated = await regRef.get();

    return NextResponse.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error("Update registration error:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/managed-events/[id]/registrations/[regId] — Delete a registration
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; regId: string }> },
) {
  try {
    const { id, regId } = await params;

    const regRef = db
      .collection(COLLECTION)
      .doc(id)
      .collection("registrations")
      .doc(regId);

    const regDoc = await regRef.get();
    if (!regDoc.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    await regRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 },
    );
  }
}
