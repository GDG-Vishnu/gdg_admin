import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all forms
export async function GET() {
  try {
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 },
    );
  }
}

// POST create a new form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, fields, steps, isActive } = body;

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: "Title and fields are required" },
        { status: 400 },
      );
    }

    const form = await prisma.form.create({
      data: {
        title,
        description: description || "",
        fields,
        steps: steps || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 },
    );
  }
}
