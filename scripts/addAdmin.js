const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const crypto = require("crypto");
require("dotenv/config");

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function addAdmin() {
  try {
    const email = "admin@gdgvitb.in";

    const adminData = {
      email,
      name: "GDG DEVS",
      password: hashPassword("123456"),
      isAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if admin already exists
    const existingSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const existingUser = existingSnapshot.docs[0];
      console.log(`Admin with email ${email} already exists!`);
      console.log(`User ID: ${existingUser.id}`);
      return;
    }

    // Create the admin user
    const docRef = await db.collection("users").add(adminData);

    console.log("Admin user created successfully!");
    console.log("-----------------------------------");
    console.log(`ID:    ${docRef.id}`);
    console.log(`Name:  ${adminData.name}`);
    console.log(`Email: ${adminData.email}`);
    console.log("-----------------------------------");
    console.log("\nLogin Credentials:");
    console.log(`Email:    admin@gdgvitb.in`);
    console.log(`Password: 123456`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

addAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
