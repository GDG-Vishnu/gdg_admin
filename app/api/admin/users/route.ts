/**
 * GET  /api/admin/users — List all client users
 * Fetches from the `client_users` Firestore collection, ordered by creation date.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const snapshot = await db
      .collection("client_users")
      .orderBy("createdAt", "desc")
      .get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        email: data.email || "",
        profileUrl: data.profileUrl || "",
        resumeUrl: data.resumeUrl || "",
        phoneNumber: data.phoneNumber || "",
        branch: data.branch || "",
        graduationYear: data.graduationYear || null,
        role: data.role || "user",
        isBlocked: data.isBlocked || false,
        profileCompleted: data.profileCompleted || false,
        participations: Array.isArray(data.participations)
          ? data.participations
          : [],
        socialMedia: data.socialMedia || {},
        createdAt: data.createdAt?._seconds
          ? new Date(data.createdAt._seconds * 1000).toISOString()
          : data.createdAt || null,
        updatedAt: data.updatedAt?._seconds
          ? new Date(data.updatedAt._seconds * 1000).toISOString()
          : data.updatedAt || null,
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch client users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
