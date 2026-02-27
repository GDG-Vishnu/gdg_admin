import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const formRef = db.collection("forms").doc(id);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const formData = formDoc.data()!;

    const responsesSnapshot = await db
      .collection("form_responses")
      .where("formId", "==", id)
      .orderBy("submittedAt", "desc")
      .get();

    const responses = responsesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      form: {
        id: formDoc.id,
        title: formData.title,
        description: formData.description,
      },
      responses,
      count: responses.length,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const formRef = db.collection("forms").doc(id);
    const formDoc = await formRef.get();

    if (!formDoc.exists) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const formData = formDoc.data()!;

    if (!formData.isActive) {
      return NextResponse.json(
        { error: "Form is no longer accepting responses" },
        { status: 403 },
      );
    }

    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json(
        { error: "Invalid response data" },
        { status: 400 },
      );
    }

    const docRef = await db.collection("form_responses").add({
      formId: id,
      data: body.data,
      submittedAt: FieldValue.serverTimestamp(),
    });

    const createdDoc = await docRef.get();
    return NextResponse.json(
      { id: createdDoc.id, ...createdDoc.data() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 },
    );
  }
}
