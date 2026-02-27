import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docRef = db.collection("forms").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const responsesSnapshot = await db
      .collection("form_responses")
      .where("formId", "==", id)
      .count()
      .get();

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
      responseCount: responsesSnapshot.data().count,
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, fields, steps, isActive } = body;

    const docRef = db.collection("forms").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (fields) updateData.fields = fields;
    if (steps !== undefined) updateData.steps = steps;
    if (isActive !== undefined) updateData.isActive = isActive;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docRef = db.collection("forms").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Firestore batches are limited to 500 operations, so chunk if needed
    const responsesSnapshot = await db
      .collection("form_responses")
      .where("formId", "==", id)
      .get();

    const BATCH_LIMIT = 499; // reserve 1 slot for the form doc itself in the last batch
    const responseDocs = responsesSnapshot.docs;

    for (let i = 0; i < responseDocs.length; i += BATCH_LIMIT) {
      const chunk = responseDocs.slice(i, i + BATCH_LIMIT);
      const isLastChunk = i + BATCH_LIMIT >= responseDocs.length;
      const batch = db.batch();
      chunk.forEach((responseDoc) => {
        batch.delete(responseDoc.ref);
      });
      if (isLastChunk) {
        batch.delete(docRef);
      }
      await batch.commit();
    }

    if (responseDocs.length === 0) {
      await docRef.delete();
    }

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 },
    );
  }
}
