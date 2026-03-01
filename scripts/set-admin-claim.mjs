/**
 * Set Firebase Auth custom claim { admin: true } for a user by email.
 * Usage:
 *   1) Download service account key JSON from Firebase Console:
 *      Project Settings > Service Accounts > Generate new private key
 *   2) Save it as: scripts/serviceAccountKey.json
 *   3) Run:
 *      npm run set-admin -- admin@example.com
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";

const email = process.argv[2];
if (!email) {
  console.error("Missing email. Example: npm run set-admin -- admin@example.com");
  process.exit(1);
}

const keyPath = path.join(process.cwd(), "scripts", "serviceAccountKey.json");
if (!fs.existsSync(keyPath)) {
  console.error("Missing scripts/serviceAccountKey.json (Firebase service account key).");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function main() {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`✅ Set admin=true for: ${email} (uid=${user.uid})`);
  console.log("ℹ️  The user should sign out and sign in again to refresh token.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
