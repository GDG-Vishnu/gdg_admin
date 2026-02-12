import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Only allow updating these fields
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

    const updated = await prisma.teamMember.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("Update member error:", err);
    const message =
      err instanceof Error && err.message.includes("Record to update not found")
        ? "Member not found"
        : "Failed to update member";
    const status = message === "Member not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
