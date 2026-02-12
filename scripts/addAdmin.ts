import "dotenv/config";
import { prisma } from "../lib/prisma";
import * as crypto from "crypto";

/**
 * Hash password using SHA-256
 * Note: In production, consider using bcrypt or argon2 for better security
 */
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function addAdmin() {
  try {
    const adminData = {
      email: "admin@gdgvitb.in",
      username: "GUNA",
      passwordHash: hashPassword("123456"),
      firstName: "GUNA",
      role: "ADMIN" as const,
      status: "ACTIVE" as const,
      permissions: ["*"], // Full permissions
    };

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      console.log(`❌ Admin with email ${adminData.email} already exists!`);
      console.log(`User ID: ${existingUser.id}`);
      return;
    }

    // Create the admin user
    const admin = await prisma.user.create({
      data: adminData,
    });

    console.log("✅ Admin user created successfully!");
    console.log("-----------------------------------");
    console.log(`ID:       ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`Status:   ${admin.status}`);
    console.log("-----------------------------------");
    console.log("\n🔑 Login Credentials:");
    console.log(`Email:    admin@gdgvitb.in`);
    console.log(`Password: 123456`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
