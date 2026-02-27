import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all responses for a form
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
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

// POST submit a new response
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify form exists and is active
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (!form.isActive) {
      return NextResponse.json(
        { error: "Form is no longer accepting responses" },
        { status: 403 },
      );
    }

    // Validate response data structure
    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json(
        { error: "Invalid response data" },
        { status: 400 },
      );
    }

    const response = await prisma.formResponse.create({
      data: {
        formId: id,
        data: body.data,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 },
    );
  }
}
