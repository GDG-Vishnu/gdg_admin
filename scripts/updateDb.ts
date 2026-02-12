import "dotenv/config";
import { execSync } from "child_process";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

console.log("✓ DATABASE_URL found");
console.log("\nPushing schema to database...\n");

try {
  execSync(`npx prisma db push --url="${dbUrl}"`, {
    stdio: "inherit",
  });

  console.log("\n✅ Database schema updated successfully!");

  // Generate Prisma client
  console.log("\nGenerating Prisma client...\n");
  execSync("npx prisma generate", {
    stdio: "inherit",
  });

  console.log("\n✅ Prisma client generated!");
} catch (error) {
  console.error("\n❌ Error updating database schema");
  process.exit(1);
}
