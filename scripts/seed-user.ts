import "dotenv/config";
import { prisma } from "../lib/prisma";
import * as crypto from "crypto";


async function main() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("Checking DATABASE_URL...");
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is missing or empty!");
  } else {
    console.log(`✅ DATABASE_URL found (length: ${dbUrl.length})`);
    console.log(`Starts with: ${dbUrl.substring(0, 15)}...`);
  }

  const email = "dev@gdg.vitb.in";
  const password = "1234567890";
  // Using SHA-256 for consistency with previous scripts/addAdmin.ts
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  console.log(`Seeding user: ${email}...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      // Ensure other fields are kept or updated as needed (e.g. ensure isAdmin is true?)
      isAdmin: true, 
    },
    create: {
      email,
      name: "Dev User",
      password: passwordHash,
      isAdmin: true,
    },
  });

  console.log("User seeded successfully:", user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
