import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "name",
      "designation",
      "position",
      "imageUrl",
      "linkedinUrl",
      "mail",
      "bgColor",
      "logo",
      "dept_logo",
      "rank",
      "dept_rank",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const docRef = db.collection("team_members").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    await docRef.update(data);

    const updatedDoc = await docRef.get();
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err: unknown) {
    console.error("Update member error:", err);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 },
    );
  }
}
