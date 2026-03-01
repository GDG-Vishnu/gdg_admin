import "dotenv/config";
import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

const REQUIRED_COLLECTIONS = [
  "events",
  "team_members",
  "gallery",
  "users",
  "forms",
  "form_responses",
];

async function verifyCollections() {
  console.log("Verifying Firestore collections...\n");

  for (const collectionName of REQUIRED_COLLECTIONS) {
    const snapshot = await db.collection(collectionName).limit(1).get();
    const status = snapshot.empty ? "EMPTY" : "OK";
    const icon = snapshot.empty ? "⚠" : "✓";
    console.log(`  ${icon} ${collectionName}: ${status}`);
  }

  console.log("\nFirestore verification complete!");
  console.log(
    "Note: Empty collections are created automatically when the first document is added.",
  );
}

verifyCollections().catch((error) => {
  console.error("Error verifying Firestore:", error);
  process.exit(1);
});
